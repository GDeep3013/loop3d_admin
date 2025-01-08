import React, { useState, useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import { useNavigate } from "react-router-dom";
import { StatusIcon, PLusIcon, SortAscIcon, SortDescIcon } from "../../../components/svg-icons/icons";
import { Container, Button, Row, Col, Tab, Tabs, Pagination } from 'react-bootstrap'
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import { Edit, Remove } from '../../../components/svg-icons/icons';
import Loading from '../../../components/Loading';

export default function Category() {

    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const [currentPageIC, setCurrentPageIC] = useState(1); // For Individual Contributor
    const [currentPagePM, setCurrentPagePM] = useState(1); // For People Manager
    const itemsPerPage = 10;

    useEffect(() => {
        getCategory();
    }, [searchTerm, currentPage, sortField, sortOrder]);

    async function getCategory() {
        setLoading(true);
        try {
            let url = `/api/categories?sortField=${sortField}&sortOrder=${sortOrder}`;
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
                        text: "Your competency has been deleted.",
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
    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSort = (field) => {
        const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newSortOrder);
    };

    const renderSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
        }
        return null;
    };


    const individualContributorData = category.filter(cat => cat.competency_type === 'individual_contributor');
    const peopleManagerData = category.filter(cat => cat.competency_type === 'people_manager');

    // Calculate total pages
    const totalPagesIC = Math.ceil(individualContributorData.length / itemsPerPage);
    const totalPagesPM = Math.ceil(peopleManagerData.length / itemsPerPage);
    const paginatedICData = individualContributorData.slice(
        (currentPageIC - 1) * itemsPerPage,
        currentPageIC * itemsPerPage
    );
    const paginatedPMData = peopleManagerData.slice(
        (currentPagePM - 1) * itemsPerPage,
        currentPagePM * itemsPerPage
    );

    // Pagination handlers
    const handlePaginationClickIC = (page) => setCurrentPageIC(page);
    const handlePaginationClickPM = (page) => setCurrentPagePM(page);
    return (
        <AuthLayout title={'Welcome to  Global  Competencies'} subTitle={' Global  Competencies'}>
            <div className="tabe-outer ">
                <div className="main-back-heading">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 p-0">
                                <div className="profile-btns pt-0">
                                    {/* <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                        Back
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-outer pd-2 edit-org ">

                <Tabs defaultActiveKey="individual_contributor" id="competency-tabs" className="custom-tabs">

                    <Tab eventKey="individual_contributor" title="Individual Contributor">
                        <div className='table-inner main-wrapper action-right '>
                            <div className='content-outer'>
                                <div className='table-heading mt-3'>
                                    <Container>
                                        <Row>
                                            <Col md={6}>
                                            </Col>
                                            <Col md={6} className='text-end p-0'>
                                                <form className='d-flex justify-content-end mb-4'>
                                                    <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                                    <Link to="create" className='default-btn' >Add Competency <PLusIcon /> </Link>
                                                </form>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                            </div>
                            <div className='table-scroll table-pd'>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Serial No.</th>
                                            <th onClick={() => handleSort('category_name')}>Competency {renderSortIcon('category_name')}</th>
                                            <th>Competency Type</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                                    <Loading />
                                                </td>
                                            </tr>
                                        )}
                                        {!loading && paginatedICData.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                                    Record not found
                                                </td>
                                            </tr>
                                        )}
                                        {!loading && paginatedICData.map((cat, ind) => (
                                            <tr key={cat._id} className='table-list-design'>
                                                <td>{(currentPageIC - 1) * itemsPerPage + ind + 1}</td>
                                                <td>{cat.category_name}</td>
                                                <td>Individual Contributor</td>
                                                <td>{cat.status === 'active' ? 'Active' : 'Inactive'}</td>
                                                <td>
                                                    <button className="action-btn" onClick={() => navigate(`/competencies/${cat._id}`)}><Edit /></button>
                                                    <button className="action-btn" onClick={() => handleDelete(cat._id)}><Remove /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPagesIC > 1 && (
                                <Pagination className="justify-content-center pagination-outer">
                                    <Pagination.First onClick={() => handlePaginationClickIC(1)} disabled={currentPageIC === 1} />
                                    <Pagination.Prev onClick={() => handlePaginationClickIC(currentPageIC - 1)} disabled={currentPageIC === 1} />
                                    {[...Array(totalPagesIC).keys()].map(page => (
                                        <Pagination.Item
                                            key={page + 1}
                                            className='link-page'
                                            active={page + 1 === currentPageIC}
                                            onClick={() => handlePaginationClickIC(page + 1)}
                                        >
                                            {page + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => handlePaginationClickIC(currentPageIC + 1)} disabled={currentPageIC === totalPagesIC} />
                                    <Pagination.Last onClick={() => handlePaginationClickIC(totalPagesIC)} disabled={currentPageIC === totalPagesIC} />
                                </Pagination>
                            )}
                        </div>
                    </Tab>

                    <Tab eventKey="people_manager" title="People Manager">
                        <div className='table-inner main-wrapper action-right'>
                            <div className='content-outer'>
                                <div className='table-heading mt-3'>
                                    <Container>
                                        <Row>
                                            <Col md={6}>
                                            </Col>
                                            <Col md={6} className='text-end p-0'>
                                                <form className='d-flex justify-content-end mb-4'>
                                                    <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                                                    <Link to="create" className='default-btn' >Add Competency <PLusIcon /> </Link>
                                                </form>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                            </div>
                            <div className='table-scroll  table-pd'>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Serial No.</th>
                                            <th onClick={() => handleSort('category_name')}>Competency {renderSortIcon('category_name')}</th>
                                            <th>Competency Type</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                                    <Loading />
                                                </td>
                                            </tr>
                                        )}
                                        {!loading && paginatedPMData.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                                    Record not found
                                                </td>
                                            </tr>
                                        )}
                                        {!loading && paginatedPMData.map((cat, ind) => (
                                            <tr key={cat._id} className='table-list-design'>
                                                <td>{(currentPagePM - 1) * itemsPerPage + ind + 1}</td>
                                                <td>{cat.category_name}</td>
                                                <td>People Manager</td>
                                                <td>{cat.status === 'active' ? 'Active' : 'Inactive'}</td>
                                                <td>
                                                    <button className="action-btn" onClick={() => navigate(`/competencies/${cat._id}`)}><Edit /></button>
                                                    <button className="action-btn" onClick={() => handleDelete(cat._id)}><Remove /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPagesPM > 1 && (
                                <Pagination className="justify-content-center pagination-outer">
                                    <Pagination.First onClick={() => handlePaginationClickPM(1)} disabled={currentPagePM === 1} />
                                    <Pagination.Prev onClick={() => handlePaginationClickPM(currentPagePM - 1)} disabled={currentPagePM === 1} />
                                    {[...Array(totalPagesPM).keys()].map(page => (
                                        <Pagination.Item
                                            key={page + 1}
                                            active={page + 1 === currentPagePM}
                                            onClick={() => handlePaginationClickPM(page + 1)}
                                        >
                                            {page + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next onClick={() => handlePaginationClickPM(currentPagePM + 1)} disabled={currentPagePM === totalPagesPM} />
                                    <Pagination.Last onClick={() => handlePaginationClickPM(totalPagesPM)} disabled={currentPagePM === totalPagesPM} />
                                </Pagination>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </AuthLayout>
    );
}
