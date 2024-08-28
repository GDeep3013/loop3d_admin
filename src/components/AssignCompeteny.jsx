import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { fetchCompetencies } from "../apis/CompentencyApi";

export default function AssignCompetency({ type, id, show, handleClose }) {
  const [selectedOption, setSelectedOption] = useState(null); // Single select state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      getCategory(); // Fetch categories when modal is opened
    }
  }, [show]);

  async function getCategory() {
    setLoading(true);
    try {
      let result = await fetchCompetencies();
      const categoryOptions = result.categories && result.categories.map((category) => ({
        value: category._id,
        label: category.category_name,
      }));
      setCategories(categoryOptions);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  const handleSelectChange = (selected) => {
    setSelectedOption(selected); // Set single selected option
  };

  const handleSubmit = async () => {
    console.log('selectedOption', selectedOption.value, id, type);
    // Example API call:
    // try {
    //   const response = await fetch(`/api/assign-competency`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'x-api-key': import.meta.env.VITE_X_API_KEY,
    //     },
    //     body: JSON.stringify({
    //       type,
    //       id,
    //       competency: selectedOption.value, // Send selected competency ID
    //     }),
    //   });
    //   if (response.ok) {
    //     console.log('Competency assigned successfully');
    //   } else {
    //     console.error('Error assigning competency');
    //   }
    // } catch (error) {
    //   console.error('Error submitting:', error);
    // }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Competency</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Form>
            <Form.Group>
              <Form.Label>Select Competency</Form.Label>
              <Select
                options={categories}
                value={selectedOption}
                onChange={handleSelectChange}
                placeholder="Select competency..."
                isSearchable
                filterOption={(option, inputValue) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
