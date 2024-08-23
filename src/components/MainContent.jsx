import React, { useState, useEffect } from 'react'
import { Container, Row, Col, DropdownButton, Form, Dropdown, Button } from 'react-bootstrap'

import Pagination from 'react-bootstrap/Pagination';
import { selectFilterValue } from '../../store/slices/DashboardSlice'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
function MainContent() {
    const filterValue = useSelector(selectFilterValue);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [project, setProject] = useState([]);


    useEffect(() => {
        getProject(filterValue);
    }, [searchTerm || selectedTerm, currentPage, filterValue]);

    async function getProject(filterValue) {
        let url = `/api/fetch-project?page=${currentPage}`;
         if (filterValue && (filterValue.price !== null || filterValue.technology.length > 0)) {
            const filterParams = new URLSearchParams(filterValue).toString();
            url += `&${filterParams}`;
    }

    // Add searchTerm or selectedTerm to the URL if provided
    if (searchTerm || selectedTerm) {
        const searchTermValue = selectedTerm ? selectedTerm : searchTerm;
        url += `&searchTerm=${encodeURIComponent(searchTermValue)}`;
    }
        let result = await fetch(url);
        result = await result.json();
        if (result.status === 'success') {
            setProject(result.projects);
            setTotalPages(result.totalPages);
        }
    }
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const handleSelectChange = (e) => {
        setSelectedTerm(e.target.value);
    };

    const options = [
        { value: '', label: 'All' },
        { value: 'HTML', label: 'HTML' },
        { value: 'CSS', label: 'CSS' },
        { value: 'Figma', label: 'Figma' },
        { value: 'Wordpress', label: 'Wordpress' },
        { value: 'Php', label: 'Php' },
        { value: 'Shopify', label: 'Shopify' },
    ];


    return (
        <div>
            <div className='latest-projects main-context'>
                <Container>
                    <Row className='align-items-center'>
                        <Col md={2}>
                            <h2>Latest Projects</h2>
                        </Col>
                        <Col md={10} className='text-end'>
                            <div className='filterBox'>
                                <div className='d-flex'>
                                    <span>Filter by:</span>
                                    <Form.Control placeholder="Search here..." value={searchTerm} onChange={handleSearch} />
                                       {/*  <Form.Select aria-label="Default select example"  className='filter-select' onChange={handleSelectChange}>
                                        {options.map((option, index) => (
                                            <option key={index} value={option.value}>{option.label}</option>
                                        ))}
                                    </Form.Select> */}
                                    <Button className='custom-btn'>Search</Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                {project.length === 0 ? (<>
                    <div className='mainContet-outer'>
                        <div className='project___info'>
                            <input type='checkbox' />
                            <div className='custom-checkbox'>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <div className='project_fullInfo'>
                                    <div > <h3 style={{ textAlign: 'center' }}>No Projects Found</h3></div>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
                ) : (project.map(projects => {
                    let skills = [];
                    if (typeof projects.skills === 'string') {
                        skills = JSON.parse(projects.skills.replace(/'/g, '"').replace(/(\[|\])/g, '')).flatMap(tag => tag.split(','));
                    } else if (Array.isArray(projects.skills)) {
                        skills = projects.skills.flatMap(tag => tag.split(','));
                    }
                    return (
                        <div className='mainContet-outer' key={projects._id}>
                            <div className='project___info'>
                                <input type='checkbox' />
                                {/* <div className='custom-checkbox'>
                                    <span><CheckIcon /></span>
                                </div> */}
                                <div className='d-flex justify-content-between'>
                                    <div className='project_fullInfo'>
                                        <h3>{projects.projectName}</h3>
                                        <p>{projects.projectDescription}</p>
                                        <div className='tagOuter d-flex'>
                                            <div className='figma_tag'>
                                                <div className='tagInner'>
                                                    {skills.map((skill, index) => (
                                                        <span key={index}>{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='view_button'>
                                        <Link className='view__btn' to={`/project-overview/${projects._id}`}>view</Link>
                                        {/* <a href='/project-overview' className='view__btn'>view</a> */}
                                    </div>
                                </div>

                                <div className='upwork-information-outer d-flex justify-content-between'>
                                    <div className='upworkInfo d-flex'>
                                        <div className='upwork-id'>Upwork:- <span>{projects.upWorkId ? projects.upWorkId : ''}</span></div>
                                        <div className='upwork-id'>Client:- <span>{projects.clientName ? projects.clientName : ''}</span></div>
                                        <div className='project_name'>Name:- <span>{projects.projectName}</span> </div>
                                        <div className='project-cost'>Cost:- <span>USD ${projects.budget}</span></div>
                                    </div>
                                    <div className='date_right'>
                                        <span>Date Created:- {new Date(projects.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }))}
            </Container>
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
        </div>
    )
}

export default MainContent
