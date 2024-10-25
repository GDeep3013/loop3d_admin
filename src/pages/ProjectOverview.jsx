import React, { useState, useEffect } from 'react'

import { Link, useNavigate, useParams } from "react-router-dom";
import AuthLayout from '../layout/Auth'
import { Col, Row, Container, Button } from 'react-bootstrap'
import { ViewIcon, CopyIcon, DownloadIcon ,TickIcon} from '../components/svg-icons/icons'
import Swal from 'sweetalert2'

export default function ProjectOverview() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [copyLinkIcons, setCopyLinkIcons] = useState({
        live: <CopyIcon/>,
        figma: <CopyIcon/>,
        github: <CopyIcon/>
    }); 
    const [project, setProject] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        getProject(id);
    }, [id]);

    async function getProject() {
        let result = await fetch(`/api/show-project/${id}`);
        result = await result.json();
        if (result.status == 'success') {
            setProject(result.project);
            setFiles(result.images);
        }
    }
    let skills = [];
    if (typeof project.skills === 'string') {
        skills = JSON.parse(project.skills.replace(/'/g, '"').replace(/(\[|\])/g, '')).flatMap(tag => tag.split(','));
    } else if (Array.isArray(project.skills)) {
        skills = project.skills.flatMap(tag => tag.split(','));
    }
    let milestoneComponents = null;

    if (project.timelineMilestone) {
        if (Array.isArray(project.timelineMilestone) && project.timelineMilestone.length > 0) {
            const timelineMilestoneData = JSON.parse(project.timelineMilestone[0]);
            milestoneComponents = timelineMilestoneData.map((milestone, index) => (
                <div key={index}>
                    <li>{milestone.text} {milestone.date ? `  :  [${milestone.date}]` : ''}</li>
                </div>
            ));
        }
    }

    const copyToClipboard = (linkToCopy, type) => {
        navigator.clipboard.writeText(linkToCopy)
            .then(() => {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Link copied to clipboard!",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                  });
              
                setCopyLinkIcons(prevState => {
                    const updatedIcons = {};
                    for (const key in prevState) {
                        updatedIcons[key] = key === type ? <TickIcon /> : <CopyIcon />;
                    }
                    return updatedIcons;
                });
            })
            .catch((error) => {
                console.error('Failed to copy:', error);
                alert('Failed to copy to clipboard.');
            });
    };

    return (
        <AuthLayout>
            <div className='overview-outer'>
                <Container>
                    <Row>
                        <Col md={9}>
                            <div className='overview-left'>
                                <div className='box-outer box-border'>
                                    <div className='top-heading'>
                                        <h2>{project.projectName}</h2>
                                        <p className='p-style'>UI Design Lead</p>
                                    </div>
                                    <div className='description-box view-page'>
                                        <h3>Melissa Fields Shopify Store for Kids' Products</h3>
                                        <p className='p-style'>{project.projectDescription}</p>

                                        <div className='key-feature mt-4'>
                                            <h4 className='h4-style'>Key Features and Functionalities:</h4>
                                            <ul className='mt-2'>
                                                {project.keyFeatures}
                                                {/* <li>Product catalog with detailed descriptions and high-quality images.</li>
                                                <li>User-friendly shopping cart and secure payment processing.</li>
                                                <li>Customer reviews and ratings.</li>
                                                <li>Search and filter options for easy product discovery.</li>
                                                <li>Mobile-responsive design for shopping on various devices.</li>
                                                <li>Integration with social media and email marketing</li> */}
                                            </ul>
                                        </div>
                                        <div className='skills-expertise mt-4'>
                                            <h4 className='h4-style'>Skills and Expertise</h4>
                                            <div className='skills d-flex'>
                                                {skills.map((skill, index) => (
                                                    <span key={index}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='skills-expertise mt-4'>
                                            <h4 className='h4-style'>Technology Stack:</h4>
                                            <p className='p-style'>The Shopify platform, HTML/CSS for custom design, Shopify Apps for added functionalities.</p>
                                        </div>
                                        {/* <div className='choose-file mt-4'>
                                            <h4 className='h4-style'>Figma Link:</h4>
                                            <div className='choose-box'>
                                                <div className='choose-input d-flex align-items-center justify-content-center'>
                                                    <input type='file' />
                                                    <FileIcon />
                                                    <p><span>Choose File</span> or Drag it here</p>
                                                </div>
                                                <div className='or-devider'>
                                                    <p><span>OR</span></p>
                                                </div>
                                                <div className='attach-link text-center mt-4'>
                                                    <h4>Attach a link</h4>
                                                    <input type='text' placeholder='Paste any link here....' className='form-control' />
                                                    <Button className='default-btn'>Attach</Button>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className='key-feature mt-4'>
                                            <h4 className='h4-style'>Timeline and Milestones:</h4>
                                            <ul className='mt-2'>
                                                {milestoneComponents}
                                                {/* <li>Project Kickoff: [23.10.23]</li>
                                                <li>Store Development and Design: [10.11.23]</li>
                                                <li>Testing and Quality Assurance: [25.11.23]</li>
                                                <li>Launch and Go-Live: [26.11.23]</li>  */}
                                            </ul>
                                        </div>
                                        <div className='key-feature mt-4'>
                                            <h4 className='h4-style'>Budget and Resources:</h4>
                                            <p className='p-style'>We have allocated a budget of [${project.budget}] for this project. We have a dedicated project team and access to design and development resources</p>
                                        </div>
                                        <div className='key-feature mt-4'>
                                            <h4 className='h4-style'>Submission Deadline:</h4>
                                            <p className='p-style'>We kindly request proposals to be submitted by [{new Date(project.submissionDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}]</p>
                                        </div>

                                        <div className='choose-file mt-4 d-flex' >
                                            <h4 className='h4-style'>Live Link:</h4><div className='link-view'>
                                                <a href={project.liveLink} target='blank'>{project.liveLink ?project.liveLink  : ' Not Available'}</a> {project.liveLink ? (
                                                    <button className='default-btn' title='Copy Link' onClick={() => copyToClipboard(project.liveLink,'live')}>{copyLinkIcons.live}</button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className='choose-file mt-4 d-flex' >
                                            <h4 className='h4-style'>Figma Link:</h4>
                                            <div className='link-view'>
                                                <a href={project.figmaLink} target='blank'>{project.figmaLink ? project.figmaLink: ' Not Available'}</a> {project.figmaLink ? (
                                                    <button className='default-btn'title='Copy Link' onClick={() => copyToClipboard(project.figmaLink,'figma')}>{copyLinkIcons.figma}</button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className='choose-file mt-4 d-flex' >
                                            <h4 className='h4-style'>Github Link:</h4>
                                            <div className='link-view'>
                                                <a href={project.githubLink} target='blank'>{project.githubLink ? project.githubLink : ' Not Available'}</a> {project.githubLink ? (
                                                    <button className='default-btn' title='Copy Link' onClick={() => copyToClipboard(project.githubLink,'github')}>{copyLinkIcons.github}</button>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className='choose-file mt-4 d-flex' >
                                            <h4 className='h4-style'>Other Files</h4>
                                        </div>
                                        <div className='other-file-data'>
                                            {files.map((file, index) => (<>
                                                <div className='file-view'>
                                                <p key={index}>{file.fileText}</p>
                                                    <a href={`/uploads/${file.src}`}  target='_blank' title='View'>
                                                        <ViewIcon /></a>
                                                        <a href={`/uploads/${file.src}`} download={file.fileText} target='_blank' title='Download'>
                                                        <DownloadIcon /></a>
                                                    {/* <DownloadIcon /> */}
                                                </div>
                                                </>
                                            ))}
                                        </div>
                                        {/*  <div className='choose-box'>
                                                <div className='choose-input d-flex align-items-center justify-content-center'>
                                                    <input type='file' />
                                                    <FileIcon />
                                                    <p><span>Choose File</span> or Drag it here</p>
                                                </div>
                                                <div className='or-devider'>
                                                    <p><span>OR</span></p>
                                                </div>
                                                <div className='attach-link text-center mt-4'>
                                                    <h4>Attach a link</h4>
                                                    <input type='text' placeholder='Paste any link here....' className='form-control' />
                                                    <Button className='default-btn'>Attach</Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='choose-file mt-4'>
                                            <h4 className='h4-style'>GitHub links:</h4>
                                            <div className='choose-box'>
                                                <div className='choose-input d-flex align-items-center justify-content-center'>
                                                    <input type='file' />
                                                    <FileIcon />
                                                    <p><span>Choose File</span> or Drag it here</p>
                                                </div>
                                                <div className='or-devider'>
                                                    <p><span>OR</span></p>
                                                </div>
                                                <div className='attach-link text-center mt-4'>
                                                    <h4>Attach a link</h4>
                                                    <input type='text' placeholder='Paste any link here....' className='form-control' />
                                                    <Button className='default-btn'>Attach</Button>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className='overview-right'>
                                <div className='box-outer box-border'>
                                    <h5>Project name</h5>
                                    <h2 className='h2-style'>Cannabis</h2>
                                    <p className='p-style'>We exist to build brilliance in young minds by providing exciting, engaging and easy to use robotics and stem activities to the K-community.</p>
                                    <Link to='/' className='default-btn'>View Project Details</Link>
                                </div>
                                <div className='box-outer box-border'>
                                    <h5>Project name</h5>
                                    <h2 className='h2-style'>Cannabis</h2>
                                    <p className='p-style'>We exist to build brilliance in young minds by providing exciting, engaging and easy to use robotics and stem activities to the K-community.</p>
                                    <Link to='/' className='default-btn'>View Project Details</Link>
                                </div>
                                <div className='box-outer box-border'>
                                    <h5>Project name</h5>
                                    <h2 className='h2-style'>Cannabis</h2>
                                    <p className='p-style'>We exist to build brilliance in young minds by providing exciting, engaging and easy to use robotics and stem activities to the K-community.</p>
                                    <Link to='/' className='default-btn'>View Project Details</Link>
                                </div>
                                <div className='box-outer box-border'>
                                    <h5>Project name</h5>
                                    <h2 className='h2-style'>Cannabis</h2>
                                    <p className='p-style'>We exist to build brilliance in young minds by providing exciting, engaging and easy to use robotics and stem activities to the K-community.</p>
                                    <Link to='/' className='default-btn'>View Project Details</Link>
                                </div>
                                <div className='box-outer box-border'>
                                    <h5>Project name</h5>
                                    <h2 className='h2-style'>Cannabis</h2>
                                    <p className='p-style'>We exist to build brilliance in young minds by providing exciting, engaging and easy to use robotics and stem activities to the K-community.</p>
                                    <Link to='/' className='default-btn'>View Project Details</Link>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </AuthLayout>
    )
}
