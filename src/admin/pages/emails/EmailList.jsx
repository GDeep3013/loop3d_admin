import React, { useState, useEffect } from 'react';
import AuthLayout from '../../../layout/Auth';
import { useNavigate } from "react-router-dom";
import { StatusIcon, PLusIcon, MoreIcon } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import {View,Edit,Remove} from '../../../components/svg-icons/icons';
import Swal from 'sweetalert2';

export default function EmailList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmails();
  }, [searchTerm, currentPage]);

  async function getEmails() {
    setLoading(true);
    try {
      let url = `/api/emails?page=${currentPage}`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      let result = await fetch(url, {
        headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
      });
      result = await result.json();
      setEmails(result.emails);
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
        const response = await fetch(`/api/emails/${id}`, {
          method: 'DELETE',
          headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
        });

        if (response.ok) {
          await Swal.fire({
            title: "Deleted!",
            text: "The email has been deleted.",
            icon: "success",
            confirmButtonColor: "#000",
          });
          getEmails();
        } else {
          console.error('Failed to delete email');
        }
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  return (
    <AuthLayout title={'Welcome to Emails'} subTitle={'Manage your emails'}>
      <div className='table-inner main-wrapper'>
        <div className='content-outer'>
          <div className='tabe-outer'>
            <div className='table-heading mt-3'>
              <Container>
                <Row>
                  <Col md={6}></Col>
                  <Col md={6} className='text-end p-0 '>
                    <form className='d-flex justify-content-end'>
                      <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                      <Link to="create" className='default-btn' >Add Email <PLusIcon /> </Link>
                    </form>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
        <div className="table-scroll  shadow-border-wrapper ml-8">
        <table className='table'>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Recipient</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && emails.length === 0 &&
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  <h4>No Emails Found</h4>
                </td>
              </tr>
            }

            {!loading && emails.length > 0 && emails.map(email => (
              <tr key={email._id}>
                <td>{email?.subject_line}</td>
                    <td>{email?.recipient_type}</td>
                <td>
                <button className='action-btn' onClick={() => navigate(`/emails/detail/${email._id}`)}><View /></button>
                <button className='action-btn' onClick={() => navigate(`/emails/${email._id}`)}><Edit /></button>
                <button className='action-btn' onClick={() => handleDelete(email._id)}><Remove /></button>
                  {/* <Dropdown className='custom-dropdown'>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      <MoreIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate(`/emails/detail/${email._id}`)}>View</Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate(`/emails/${email._id}`)}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(email._id)}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
