import React, { useState, useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import { useNavigate, useParams } from "react-router-dom";
import { StatusIcon, PLusIcon, MoreIcon } from "../../../components/svg-icons/icons";
import { Container, Dropdown, Pagination, Row, Col, } from 'react-bootstrap'
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import { Edit, Remove } from '../../../components/svg-icons/icons';
import Loading from '../../../components/Loading';

export default function Category() {

    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategory();
    }, [searchTerm, currentPage]);


    async function getCategory() {
        setLoading(true);
        try {
            let url = `/api/categories?page=${currentPage}`;
            if (searchTerm) {
                url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
            }
            let result = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            result = await result.json();
            setCategory(result.categories);
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
                    // alert(response.message);
                    getCategory();
                } else {
                    console.error('Failed to delete user');
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <AuthLayout title={'Welcome to Competency'} subTitle={'Competency'}>

            <div className='table-inner main-wrapper'>
                <div className='content-outer'>
                    <div className='tabe-outer'>
                        <div className='table-heading mt-3'>
                            <Container>
                                <Row>
                                    <Col md={6}>
                                    </Col>
                                    <Col md={6} className='text-end p-0'>
                                        <form className='d-flex justify-content-end'>
                                            <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                            <Link to="create" className='default-btn' >Add Competency <PLusIcon /> </Link>
                                        </form>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </div>
                </div>
                <div className='table-scroll  shadow-border-wrapper ml-8'>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Serial No.</th>
                                <th>Competency</th>
                                <th>Competency Type</th>
                                <th>Status <StatusIcon /> </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>

                            {loading && (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center' }}>
                                        <Loading />
                                    </td>
                                </tr>)
                            }

                            {!loading && category.length === 0 &&
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>
                                        <h4>No Category Found</h4>
                                    </td>
                                </tr>
                            }

                            {!loading && category.length > 0 && category?.map((cat, ind) => (
                                <tr key={cat._id}>
                                    <td>{ind + 1}</td>
                                    <td>
                                        {cat.category_name}
                                    </td>
                                    <td>
                                        {cat?.competency_type && (
                                            cat.competency_type === "individual_contributor" ? "Individual Contributor" :
                                                cat.competency_type === "people_manager" ? "People Manager" :
                                                    null // Default or fallback value if needed
                                        )}
                                    </td>
                                    <td>
                                    {cat?.status && (
                                            cat.status === "active" ? <span className='span-badge active-tag'>Active</span> :
                                                cat.status === "inactive" ? <span className='span-badge inactive-tag'>Inactive</span> :
                                                    null // Default or fallback value if needed
                                        )}
                                        {/* <span className='span-badge active-tag'>Active</span> */}
                                    </td>
                                    <td>
                                        <button className='action-btn' onClick={() => navigate(`/competencies/${cat._id}`)}><Edit /></button>
                                        <button className='action-btn' onClick={() => handleDelete(cat._id)}><Remove /></button>
                                        {/* <Dropdown className='custom-dropdown'>
                                            <Dropdown.Toggle variant="success" id="dropdown-basic">
                                                <MoreIcon />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => navigate(`/competencies/${cat._id}`)}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDelete(cat._id)}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown> */}
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
                    {/*[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item
                            key={page + 1}
                            className='link-page'
                            active={page + 1 === currentPage}
                            onClick={() => handlePaginationClick(page + 1)}
                        >
                            {page + 1}
                        </Pagination.Item>
                    ))*/}
                    <Pagination.Next onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePaginationClick(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            )}

        </AuthLayout>
    )
}
