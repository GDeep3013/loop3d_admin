import React, { useState, useEffect } from 'react';
import AuthLayout from '../../layout/Auth';
import { useNavigate } from "react-router-dom";
import { StatusIcon, PLusIcon, MoreIcon } from "../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import QuestionStatusUpdate from './QuestionStatusUpdate';

export default function Question() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestions();
  }, [searchTerm, currentPage]);

  async function getQuestions() {
    setLoading(true);
    try {
      let url = `/api/questions?page=${currentPage}`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
      });
      result = await result.json();
      setQuestions(result.questions);
      setTotalPages(result.meta.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  const handlePaginationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    try {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#d26c6c",
        confirmButtonText: "Yes, delete it!"
      });

      if (confirmResult.isConfirmed) {
        const response = await fetch(`/api/questions/${id}`, {
          method: 'DELETE',
          headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
        });

        if (response.ok) {
          await Swal.fire({
            title: "Deleted!",
            text: "The question has been deleted.",
            icon: "success",
            confirmButtonColor: "#000",
          });
          getQuestions();
        } else {
          console.error('Failed to delete question');
        }
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <AuthLayout title={'Welcome to Questions'} subTitle={'Questions'}>
      <div className='table-inner'>
        <div className='content-outer'>
          <div className='tabe-outer'>
            <div className='table-heading'>
              <Container>
                <Row>
                  <Col md={6}>
                  </Col>
                  <Col md={6} className='text-end'>
                    <form className='d-flex justify-content-end'>
                      <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                      <Link to="create" className='default-btn' >Add Question <PLusIcon /> </Link>
                    </form>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
        <table className='table'>
          <thead>
            <tr>
              <th>Question</th>
              <th>Status <StatusIcon /> </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && questions.length === 0 &&
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  <h4>No Questions Found</h4>
                </td>
              </tr>
            }

            {!loading && questions.length > 0 && questions?.map(question => (
              <tr key={question._id}>
                <td>
                  {question.questionText}
                </td>
                <td><span className='span-badge active-tag'>Active</span></td>
                <td>
                  <Dropdown className='custom-dropdown'>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      <MoreIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate(`/questions/detail/${question._id}`)}>View</Dropdown.Item>
                     <Dropdown.Item onClick={() => navigate(`/questions/${question._id}`)}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(question._id)}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>

      </div>
      {totalPages > 1 && (
        <Pagination className='justify-content-center pagination-outer'>
          <Pagination.First onClick={() => handlePaginationClick(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
          <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}
    </AuthLayout>
  );
}
