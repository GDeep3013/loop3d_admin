import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { StatusIcon, PLusIcon, MoreIcon } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col, } from 'react-bootstrap'
import { Link } from "react-router-dom";
import { Edit, Remove } from '../../../components/svg-icons/icons';
import Swal from 'sweetalert2'

import Loading from '../../../components/Loading';

export default function EmployeeTable({ }) {
  // const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [Employe, setEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployee();
  }, [searchTerm, currentPage]);

  async function getEmployee() {
    let url = `/api/fetch-user?page=${currentPage}`; // Include currentPage in the URL
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    let result = await fetch(url);
    result = await result.json();
    if (result.status === 'success') {
      setEmployee(result.users);
      setTotalPages(result.totalPages); // Set totalPages received from the backend
    }
    setLoading(false);
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
        const response = await fetch(`api/delete-user/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
            confirmButtonColor: "#000",
          });
          getEmployee();
        } else {
          console.error('Failed to delete user');
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  return (<>
    <div className='table-inner main-wrapper action-right'>
      <div className='content-outer mt-3'>
        <div className='tabe-outer'>
          <div className='table-heading'>
            <Container>
              <Row>
                <Col md={6}>
                  {/* <span className='span-badge primary-tag'>12 members</span> */}
                </Col>
                <Col md={6} className='text-end p-0'>
                  <form className='d-flex justify-content-end'>
                    <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                    <Link to="/add-user" className='default-btn' >Add User  <PLusIcon /> </Link>
                  </form>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
      <div className='table-scroll shadow-border-wrapper'>
        <table className='table'>
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email address</th>
              <th>Role</th>
              <th>Orgnization</th>
              <th>Status <StatusIcon /> </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>

            {loading && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  <Loading />
                </td>
              </tr>)
            }

            {!loading && Employe.length == 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  <h4>No User Found</h4>
                </td>
              </tr>)
            }
            {
              !loading && Employe.length > 0 && Employe.map((user, ind) => (

                user?.role?.type != "admin" &&
                <tr key={user?._id} className='table-list-design'>
                  <td>{(currentPage - 1) * 10 + (ind + 1)}</td>
                  <td>
                    <div className="user-profile d-flex align-items-center">
                      <div className='user-name'>{user?.first_name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="user-profile d-flex align-items-center">
                      <div className='user-name'>{user.last_name !== null ? user.last_name : ''}</div>
                    </div>
                  </td>
                  <td className='text-lowercase'> <Link
                    to={`mailto:${user.email}`}
                    onClick={(e) => {
                     // Prevent Link navigation
                      if (user?.email) {
                        window.location.href = `mailto:${user.email}`; // Trigger mail client
                      }
                    }}
                  >
                    {user?.email}
                  </Link>
                  </td>
                    {/* <td>{user?.role?.type == "looped_lead" ? "loop lead" : user?.role?.type}</td> */}
                    <td>{user?.role?.type == "looped_lead" ? "loop3D lead" : (user?.role?.type=='manager'?"Supervisor":user?.role?.type)}</td>
                  <td>{user?.organization?.name}</td>
                  <td><span className='span-badge active-tag'>Active</span></td>
                  <td>
                    {/* <button className='action-btn' onClick={() => navigate(`/add-user/${user._id}`)}><Edit /></button> */}
                    <button className='action-btn' onClick={() => handleDelete(user._id)}><Remove /></button>

                  </td>
                </tr>
              ))
            }

          </tbody>
        </table>
      </div>
    </div>
    {totalPages > 1 && (
      <Pagination className='justify-content-center pagination-outer'>
        <Pagination.First onClick={() => handlePaginationClick(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
        {[...Array(totalPages).keys()].map(page => (
          <Pagination.Item
            key={page + 1}
            className='link-page'
            active={page + 1 === currentPage}
            onClick={() => handlePaginationClick(page + 1)}
          >
            {page + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    )}
  </>
  )
}
