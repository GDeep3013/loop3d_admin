import React, { useState, useEffect } from 'react';
import { StatusIcon, PLusIcon } from "../../../components/svg-icons/icons";
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import Loading from '../../../components/Loading';
import { getAssignmentsByUserAndOrg, createAssignCompetency } from "../../../apis/assignCompetencyApi"; 

export default function AssignCompetencies({ data, type }) {

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [competencies, setCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompetencies, setSelectedCompetencies] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const [category, setCategory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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
            setSelectedCompetencies(result.assignments?.map(assignment => assignment?.category_id?._id)); 
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    }

    const handleCheckboxChange = async (categoryId) => {
        const isAssigned = selectedCompetencies.includes(categoryId);
        const action = isAssigned ? 'unassign' : 'assign'; 
    
        try {
            const response = await createAssignCompetency({
                action,
                type,
                user_id: user?._id,
                ref_id: data?.ref_id,
                category_id: categoryId,
            });
    
            if (response) {
                Swal.fire({
                    title: isAssigned ? "Unassigned!" : "Assigned!",
                    text: `Competency ${isAssigned ? "unassigned" : "assigned"} successfully`,
                    icon: "success",
                    confirmButtonColor: "#000",
                });
    
                setSelectedCompetencies(isAssigned
                    ? selectedCompetencies.filter(id => id !== categoryId)
                    : [...selectedCompetencies, categoryId]
                );
    
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
            <Tabs defaultActiveKey="individual_contributor"  id="competency-tabs" className="mb-3 custom-tabs">
                <Tab eventKey="individual_contributor" className='custom-tabs' title="Individual Contributor">
                    <div className='content-outer'>
                   
                        <div className='list-scroll'>
                            <ul className='custom-tabs'>
                                {loading && (
                                    <li className='list-group-item text-center'>
                                        <Loading />
                                    </li>
                                )}
                                {!loading && category
                                    .filter(cat => cat.competency_type === 'individual_contributor' && cat.status !== "inactive")
                                    .map((cat, ind) => (
                                        <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                            <input
                                                type="checkbox"
                                                checked={selectedCompetencies.includes(cat._id)}
                                                onChange={() => handleCheckboxChange(cat._id)}
                                            />
                                            <span> {cat.category_name}</span>
                                           
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="people_manager" title="People Manager">
                    <div className='content-outer'>
                   
                        <div className='list-scroll'>
                            <ul className='custom-tabs'>
                                {loading && (
                                    <li className='list-group-item text-center'>
                                        <Loading />
                                    </li>
                                )}
                                {!loading && category
                                    .filter(cat => cat.competency_type === 'people_manager' && cat.status !== "inactive")
                                    .map((cat, ind) => (
                                        <li key={cat._id} className='list-group-item d-flex align-items-center'>
                                            <input
                                                type="checkbox"
                                                checked={selectedCompetencies.includes(cat._id)}
                                                onChange={() => handleCheckboxChange(cat._id)}
                                            />
                                            <span>{cat.category_name}</span>
                                         
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
