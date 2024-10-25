import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { StatusIcon, PLusIcon, MoreIcon } from "./svg-icons/icons";
import { Dropdown } from 'react-bootstrap'
import { Container, Row, Col, Pagination } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
export default function ProjectsTable() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [project, setProject] = useState([]);

  useEffect(() => {
    getProject();
  }, [searchTerm, currentPage]);

  async function getProject() {
    let url = `/api/fetch-project?page=${currentPage}`;
    // Append search term to the URL if it's provided
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
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
        const response = await fetch(`api/delete-project/${id}`, {
          method: 'DELETE'
        });
  
        if (response.ok) {
          await Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
            confirmButtonColor: "#000",
          });
  
          getProject();
        } else {
          console.error('Failed to delete project');
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };
  return (<>
    <div className='table-inner'>
      <div className='content-outer'>
        <div className='tabe-outer'>
          <div className='table-heading'>
            <Container>
              <Row>
                <Col md={6}>
              
                </Col>
                <Col md={6} className='text-end'>
                  <form className='d-flex justify-content-end'>
                    <input type='search' placeholder='Search...' value={searchTerm} onChange={handleSearch} className='form-control' />
                    <Link className='default-btn' to="/add-surveys">Add Survey  <PLusIcon /> </Link>
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
            <th>Survey</th>
            <th>Category</th>       
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {project.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                <h4>No Survey Found</h4>
              </td>
            </tr>
          ) : (
            project.map(projects => (
              <tr key={projects._id}>
                <td>
                  <div className='project-name'>
                    <h3>{projects.projectName}</h3>
                    <p>{projects.projectDescription}</p>
                  </div>
                </td>
                <td><div className='tagOuter d-flex'>

                  {projects.skills.map((skillsString, index) => (
                    <div key={index} className='tagOuter d-flex'>
                      {skillsString.split(',').map((skill, skillIndex) => (
                        <div key={skillIndex} className='figma_tag'>
                          <div className='tagInner'>
                            <span>{skill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                </div></td>
           
                <td>
                  <Dropdown className='custom-dropdown'>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      <MoreIcon />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => navigate(`/add-surveys/${projects._id}`)}>Edit</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDelete(projects._id)}>Delete</Dropdown.Item>
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
    )}</>
  )
}
