import React, { useState, useEffect } from 'react'
import AuthLayout from '../../../layout/Auth'
import { useNavigate } from "react-router-dom";
import { StatusIcon, PLusIcon } from "../../../components/svg-icons/icons";
import { Container,Button, Row, Col, Tab, Tabs } from 'react-bootstrap'
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import { Edit, Remove } from '../../../components/svg-icons/icons';
import Loading from '../../../components/Loading';

export default function Category() {

    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategory();
    }, [searchTerm]);

    async function getCategory() {
        setLoading(true);
        try {
            let url = `/api/categories`;
            if (searchTerm) {
                url += `?searchTerm=${encodeURIComponent(searchTerm)}`;
            }
            let result = await fetch(url, {
                headers: { 'x-api-key': import.meta.env.VITE_X_API_KEY }
            });
            result = await result.json();
            setCategory(result.categories);
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

    return (
        <AuthLayout title={'Welcome to Competency'} subTitle={'Competency'}>
  <div className="tabe-outer">
                <div className="main-back-heading">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6 p-0">
                                <div className="profile-btns pt-0">
                                    <Button className="default-btn cancel-btn ml-0" onClick={() => navigate(-1)}>
                                        Back
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
<div className="content-outer pd-2 edit-org ">

                <Tabs defaultActiveKey="individual_contributor" id="competency-tabs" className="mb-3 custom-tabs">

                <Tab eventKey="individual_contributor" title="Individual Contributor">
                <div className='table-inner main-wrapper'>
                    <div className='content-outer'>
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
                        <div className='table-scroll table-pd'>
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
                                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                                <Loading />
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && category.filter(cat => cat.competency_type === 'individual_contributor').map((cat, ind) => (
                                        <tr key={cat._id}>
                                            <td>{ind + 1}</td>
                                            <td>{cat.category_name}</td>
                                            <td>{cat.competency_type === "individual_contributor" ? "Individual Contributor" : "People Manager"}</td>

                                            <td>{cat.status === "active" ? <span className='span-badge active-tag'>Active</span> : <span className='span-badge inactive-tag'>Inactive</span>}</td>
                                            <td>
                                                <button className='action-btn' onClick={() => navigate(`/competencies/${cat._id}`)}><Edit /></button>
                                                <button className='action-btn' onClick={() => handleDelete(cat._id)}><Remove /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                </div>
                    </Tab>

                <Tab eventKey="people_manager" title="People Manager">
                <div className='table-inner main-wrapper'>
                    <div className='content-outer'>
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
                        <div className='table-scroll  table-pd'>
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
                                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                                <Loading />
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && category.filter(cat => cat.competency_type === 'people_manager').map((cat, ind) => (
                                        <tr key={cat._id}>
                                            <td>{ind + 1}</td>
                                            <td>{cat.category_name}</td>
                                            <td>{cat.competency_type === "individual_contributor" ? "Individual Contributor" : "People Manager"}</td>

                                            <td>{cat.status === "active" ? <span className='span-badge active-tag'>Active</span> : <span className='span-badge inactive-tag'>Inactive</span>}</td>
                                            <td>
                                                <button className='action-btn' onClick={() => navigate(`/competencies/${cat._id}`)}><Edit /></button>
                                                <button className='action-btn' onClick={() => handleDelete(cat._id)}><Remove /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </Tab>
                </Tabs>
                </div>
        </AuthLayout>
    );
}
