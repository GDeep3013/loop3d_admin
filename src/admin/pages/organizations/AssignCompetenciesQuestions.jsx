import React, { useState, useEffect } from 'react';
import { StatusIcon, PLusIcon } from "../../../components/svg-icons/icons";
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import Loading from '../../../components/Loading';
import { getAssignmentsByUserAndOrg, createAssignCompetency } from "../../../apis/assignCompetencyApi"; 

export default function AssignCompetenciesQuestions({ data, type }) {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompetencies, setSelectedCompetencies] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState("");

    useEffect(() => {
        if (data?.ref_id) {
            getCategory();
            getAllCategory();
        }
    }, [currentPage, searchTerm, data?.ref_id]);

    async function getAllCategory() {
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

    async function getCategory() {
        setLoading(true);
        try {
            const result = await getAssignmentsByUserAndOrg(user?._id, data?.ref_id, type);
            setCompetencies(result.assignments ? result.assignments : []); 
            setTotalPages(result.totalPages); 
            setSelectedCompetencies(result.assignments?.map(assignment =>
                assignment?.category_id?._id
                
            )); 
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    const handleCheckboxChange = async (categoryId) => {
        const isAssigned = selectedCompetencies?.includes(categoryId);
        const action = isAssigned ? 'unassign' : 'assign'; 

            if (isAssigned && selectedCompetencies.length <= 3) {
                setError(`You must keep at least 3 competencies selected.`);
                return; // Exit the function, don't proceed
            } else {
                setError("")
            }

        try {
            const response = await createAssignCompetency({
                action,
                type,
                user_id: user?._id,
                ref_id: data?.ref_id,
                category_id: categoryId,
            });
    
            if (response) {
                !isAssigned && setSelectedCompetencies(...selectedCompetencies, categoryId);
            ;
                getCategory();
            } else {
                console.error(`Error ${isAssigned ? 'unassigning' : 'assigning'} competency`);
            }
        } catch (error) {
            console.error(`Error ${isAssigned ? 'unassigning' : 'assigning'} competency:`, error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
 
    return (
        <div className="content-outer pd-2 edit-org ">

            <Row className='custom_tab_content'>
                <Col md={4}>
                
                    <div className='list-scroll'>
                        <h3>Individual Contributor</h3>
                            <ul className='custom-tabs'>
                       
                                {category && category
                                    .filter(cat => cat.competency_type === 'individual_contributor' && cat.status !== "inactive")
                                    .map((cat, ind) => (
                                        <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                            <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedCompetencies.includes(cat?._id)}
                                                onChange={() => handleCheckboxChange(cat?._id)}
                                            />
                                                <span> {cat.category_name.trimStart()}</span>
                                            </label>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                </Col>
                <Col md={4}>
                    <div className='list-scroll'>
                    <h3>People Manager</h3>
                            <ul className='custom-tabs'>
                         
                                {category && category
                                    .filter(cat => cat.competency_type === 'people_manager' && cat.status !== "inactive")
                                    .map((cat, ind) => (
                                        <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                            <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedCompetencies?.includes(cat?._id)}
                                                onChange={() => handleCheckboxChange(cat?._id)}
                                            />
                                                <span>{cat.category_name.trimStart()}</span>
                                                </label>
                                         
                                        </li>
                                    ))}
                            </ul>
                        </div>
                </Col>
                <span className='text-danger mt-3'>{error}</span>
            </Row>
        </div>
    );
}
