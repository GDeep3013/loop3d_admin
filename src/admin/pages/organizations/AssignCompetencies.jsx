import React, { useState, useEffect } from 'react';
import { StatusIcon, PLusIcon, Remove } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import AssignCompeteny from '../../../components/AssignCompeteny'; // Import the AssignCompetency component
import { useSelector } from 'react-redux';

import { getAssignmentsByUserAndOrg ,deleteAssignCompetency } from "../../../apis/assignCompetencyApi"; // Update to your actual API import

export default function AssignCompetencies({ data, type }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignCompetencyModal, setShowAssignCompetencyModal] = useState(false);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (data?.ref_id) {
            getCategory();
        }
    }, [currentPage, data?.ref_id]);

    async function getCategory() {
        setLoading(true);
        try {
            // Call the API with appropriate parameters
            const result = await getAssignmentsByUserAndOrg(user?._id,data?.ref_id, type);
            setCompetencies(result.assignments?result.assignments:[]); // Adjust based on the API response structure
            setTotalPages(result.totalPages); // Adjust based on the API response structure
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (id,category_id) => {
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
                const response = await deleteAssignCompetency(id);
                if (response.status) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "The assignment has been deleted.",
                        icon: "success",
                        confirmButtonColor: "#000",
                    });
                    getCategory();
                } else {
                    console.error('Failed to delete assignment');
                }
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
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
                                <Row className='align-items-center'>
                                    <Col md={6}>
                                    </Col>
                                    <Col md={6} className='text-end'>
                                        <Button onClick={handleShowAssignCompetencyModal} className='default-btn'>
                                        Assign Competency <PLusIcon />
                                        </Button>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                </div>
                <div className='table-scroll table-pd'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Competency</th>
                            <th>Competency Type</th>
                            <th>User Name</th>
                            <th>Status <StatusIcon /></th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && competencies.length === 0 &&
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    <h4>No Competencies Found</h4>
                                </td>
                            </tr>
                        }

                        {!loading && competencies.length > 0 && competencies.map(cat => (
                            
                                    <tr>
                                <td>{cat.category_id?.category_name}</td>
                                <td>{cat.category_id?.competency_type}</td>
                                        <td>{cat.user_id?.first_name} {cat.user_id?.last_name}</td>
                                        <td><span className='span-badge active-tag'>Active</span></td>
                                        <td>
                                        <button className='action-btn' onClick={() => handleDelete(cat._id)}><Remove /></button>
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

            {data && <AssignCompeteny
                type={type}
                id={data?.ref_id}
                show={showAssignCompetencyModal}
                handleClose={handleCloseAssignCompetencyModal}
                getCategory={getCategory}
            /> }

        </div>
    );
}
