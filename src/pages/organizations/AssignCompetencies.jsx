import React, { useState, useEffect } from 'react';
import { StatusIcon, PLusIcon, MoreIcon } from "../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col,Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import AssignCompeteny from '../../components/AssignCompeteny'; // Import the AssignCompetency component

import { fetchCompetencies } from "../../apis/CompentencyApi";

export default function AssignCompetencies({ orgniation, type }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAssignCompetencyModal, setShowAssignCompetencyModal] = useState(false); // State for modal visibility

    useEffect(() => {
        getCategory();
    }, [currentPage]);

    async function getCategory() {
        setLoading(true);
        try {
            let result = await fetchCompetencies();
            setCompetencies(result.categories);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
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
                const response = await fetch(`api/categories/${id}`, {
                    method: 'DELETE',
                    headers: { "x-api-key": import.meta.env.VITE_X_API_KEY }
                });
                if (response.ok) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    getCategory();
                } else {
                    console.error('Failed to delete user');
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleShowAssignCompetencyModal = () => {
        setShowAssignCompetencyModal(true);
    };

    const handleCloseAssignCompetencyModal = () => {
        setShowAssignCompetencyModal(false);
    };

    return (
        <div>
            <div className='table-inner'>
                <div className='content-outer'>
                    <div className='tabe-outer'>
                        <div className='table-heading'>
                            <Container>
                                <Row>
                                    <Col md={6}>
                                        <h4>Competencies that belong to {orgniation?.name}</h4>
                                    </Col>
                                    <Col md={6} className='text-end'>
                                        <form className='d-flex justify-content-end'>
                                            <Button onClick={handleShowAssignCompetencyModal} className='default-btn'>
                                                Add Competency <PLusIcon />
                                            </Button>
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
                            <th>Competency</th>
                            <th>Parent Competency</th>
                            <th>Status <StatusIcon /></th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && competencies.length === 0 &&
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    <h4>No Competencies Found</h4>
                                </td>
                            </tr>
                        }

                        {!loading && competencies.length > 0 && competencies?.map(cat => (
                            <tr key={cat._id}>
                                <td>{cat.category_name}</td>
                                <td>{cat?.parent_id?.category_name}</td>
                                <td><span className='span-badge active-tag'>Active</span></td>
                                <td>
                                    <Dropdown.Item onClick={() => handleDelete(cat._id)}>Delete</Dropdown.Item>
                                </td>
                            </tr>
                        ))}
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

            {/* Modal for Assigning Competencies */}
            <AssignCompeteny
                type={type}
                id={orgniation?.orgniation_id}
                show={showAssignCompetencyModal}
                handleClose={handleCloseAssignCompetencyModal}
            />
        </div>
    );
}
