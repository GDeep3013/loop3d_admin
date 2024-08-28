import LeftNav from '../components/LeftNav';
import HeaderDashboard from '../components/HeaderDashboard'

export default function AuthLayout({ children, title,subTitle}) {
  return (
    <div className='wrapper-outer d-flex'>
      <div className='side-nav'>
        <LeftNav />
      </div>
      <div className='main-content'>
        <HeaderDashboard title={title} subTitle={subTitle} />
        {children}
      </div>
    </div>
  );
}
