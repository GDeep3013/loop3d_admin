import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Dropdown } from 'react-bootstrap'
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';


import AuthLayout from '../../layout/Auth'
import { StatusIcon, PLusIcon, MoreIcon } from '../../components/svg-icons/icons'

export default function Organization() {

    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    //const itemsPerPage = 10;

    const [Organizations, setOrganizations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getOrganizations();
    }, [searchTerm, currentPage]);

    async function getOrganizations() {
        let url = `/api/organizations?page=${currentPage}`; // Include currentPage in the URL
        if (searchTerm) {
            url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        }

        let result = await fetch(url, {
            headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
        });
        result = await result.json();

        if (result.status === 'success') {
            setOrganizations(result.data);
            setTotalPages(result.totalPages); // Set totalPages received from the backend
        }
    }
    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    /**
     * Delete The Organization
     * @param {*} id 
    */
    const handleDelete = async (id) => {
        try {
            const confirmResult = await Swal.fire({
                title: "Are you sure want to delete?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#000",
                cancelButtonColor: "#d26c6c",
                confirmButtonText: "Yes, delete it!"
            });

            if (confirmResult.isConfirmed) {

                const response = await fetch(`api/organizations/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
                });
           
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your organization and it's related data has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    // alert(response.message);
                    getOrganizations();
                } else {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Failed to delete organization.",
                        icon: "error",
                        confirmButtonColor: "#000",
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting organization:', error);
        }
    };

    return (
        <AuthLayout title={'Welcome to Organizations'} subTitle={'Organizations List'}>
            <div className='table-inner'>
                <div className='content-outer'>
                    <div className='tabe-outer'>
                        <div className='table-heading'>
                            <Container>
                                <Row>
                                    <Col md={6}>
                                        {/* <span className='span-badge primary-tag'>12 members</span> */}
                                    </Col>
                                    <Col md={6} className='text-end'>
                                        <form className='d-flex justify-content-end'>
                                            <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                            <Link to="create" className='default-btn' >Add Organizations  <PLusIcon /> </Link>
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
                            <th>ID</th>
                            <th>Organizations Name</th>
                            <th>CreatedAt </th>
                            <th>Status <StatusIcon /> </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Organizations.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    <h4>No Organizations Found</h4>
                                </td>
                            </tr>
                        ) : (
                                Organizations.map(org => (
                                    <tr key={org._id}>
                                        <td>{org._id}</td>
                                        <td>
                                            <div className="user-profile d-flex align-items-center">
                                                <div className='user-name'>{org.name}</div>
                                            </div>
                                        </td>
                                        <td>{org.createdAt}</td>
                                        <td><span className='span-badge active-tag'>Active</span></td>
                                        <td>
                                            <Dropdown className='custom-dropdown'>
                                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                    <MoreIcon />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => navigate(`edit/${org._id}`)}>Edit</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleDelete(org._id)}>Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

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
        </AuthLayout>
    )
}