import Spinner from 'react-bootstrap/Spinner';

export default function Loading({ parentClas = "table-loader"}) {

  if(parentClas == "table-loader"){
    return <Spinner animation="border" variant="primary" />
  }

  return (
    <div className={parentClas}>
      <img src="/images/logoheader.svg" alt="Logo" />
    </div>    
  )
}
