import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { fetchCompetencies, fetchSubcategories } from "../apis/CompentencyApi";
import { createAssignCompetency } from "../apis/assignCompetencyApi";
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

export default function AssignCompetency({ type, id, show, handleClose,getCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]); // Multiple select state
  const [loading, setLoading] = useState(false);
  const [subcatLoading, setSubcatLoading] = useState(false); // For subcategory loading
  const userId = useSelector((state) => state.auth.user._id);

  useEffect(() => {
    if (show) {
      getCategories(); // Fetch categories when modal is opened
    }
  }, [show]);

  useEffect(() => {
    if (selectedCategory) {
      getSubcategories(selectedCategory.value); // Fetch subcategories when a category is selected
    }
  }, [selectedCategory]);

  async function getCategories() {
    setLoading(true);
    try {
      let result = await fetchCompetencies("AssignCompetency");
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

  async function getSubcategories(categoryId) {
    setSubcatLoading(true);
    try {
      let result = await fetchSubcategories(categoryId);
      const subcategoryOptions = result.subcategories && result.subcategories.map((subcat) => ({
        value: subcat._id,
        label: subcat.category_name,
      }));

      setSubcategories(subcategoryOptions);
      setSubcatLoading(false);
    } catch (error) {
      console.error(error);
      setSubcatLoading(false);
    }
  }

  const handleCategoryChange = (selected) => {
    setSelectedCategory(selected); // Set selected category
    setSelectedSubcategories([]); // Reset subcategory selections when category changes
  };

  const handleSubcategoryChange = (selectedOptions) => {
    setSelectedSubcategories(selectedOptions || []); // Set multiple selected subcategories
  };

  const handleSubmit = async () => {


    try {
      const response = await createAssignCompetency({
        type,
        user_id: userId,
        ref_id: id,
        category_id: selectedCategory.value, // Send selected category ID
        subcategories: (selectedSubcategories.length >0 )? selectedSubcategories.map(option => option.value):[] // Send selected subcategory IDs
      });

      if (response) {
          await Swal.fire({
            title: "Assigned!",
            text: "Competency assigned successfully",
            icon: "success",
            confirmButtonColor: "#000",
        });
        getCategory();

        console.log('Competency assigned successfully');
      } else {
        console.error('Error assigning competency');
      }
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign Competency</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading || subcatLoading ? (
          <Spinner animation="border" />
        ) : (
          <Form>
            <Form.Group>
              <Form.Label>Select Category</Form.Label>
              <Select
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Select category..."
                isSearchable
                filterOption={(option, inputValue) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Group>

            {selectedCategory && (
              <Form.Group>
                <Form.Label className='pt-3 font-weight-bold'>Select Subcategories</Form.Label>
                <Select
                  options={subcategories}
                  value={selectedSubcategories}
                  onChange={handleSubcategoryChange}
                  isMulti
                  placeholder="Select subcategories..."
                  isSearchable
                  filterOption={(option, inputValue) =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                  }
                />
              </Form.Group>
            )}
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
