// import LandingPage from "./component/Banner/LandingPage"
import { Suspense, lazy } from "react"
const Whyesds = lazy(() => import( './component/WhyESDS/WhyEsds'))
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Loader from './component/Loader/Loader'
import EnterpriesCloud from "./component/Cloud/EnterpriseCloud"
import PrivateCloud from "./component/Cloud/PrivateCloud"
import Leadershiptwo from "./component/Leadership/Leadershiptwo"
import BFSICloud from "./component/Cloud/BFSICloud"
import Leadership from "./component/Leadership/Leadership"
const NavbarInner = lazy(() => import('./component/Navbar/Navbar')) 
const AboutUs = lazy(() => import('./component/About Us/AboutUs'))
const Colocation = lazy(() => import('./component/Colocation/Colocation'))
const Cloud = lazy(() => import('./component/Cloud/Cloud')) 
const ManageSecuServices = lazy(() => import('./component/Manage Services/ManagedServcies'))
const ContactPage = lazy(() => import('./component/contact page/ContactPage')) 
import ManageSecurity from "./component/ManagedSecurityServices/ManageSecurity"

const Saas = lazy(() => import('./component/SaaS/Saas'))
const Paas = lazy(() => import('./component/PaaS/Paas'))
import GovernmentCloudServices from "./component/Cloud/GovernmentCloudServices"
const NotFound = lazy(() => import('./component/NotFound/NotFound'))
import ThankYou from "./component/NotFound/ThankYouPage"
import SOCservices from "./component/ManagedSecurityServices/SOCservices"
const AnnualReports = lazy(() => import('./component/AnnualReports/AnnualReports'))
const WhitePapers = lazy(() => import('./component/WhitePapers/WhitePapers'))
const Landing = lazy(() => import('./component/LandingPage/LandingPage'))
import Certificate from "./component/Certificate/Certificate"
import { Helmet } from "react-helmet"
import { useLocation } from "react-router-dom"
// const LandingPage = lazy(() => import("./component/Banner/LandingPage"))
import InnerPageLoader from "./component/Loader/InnerPageLoader"
export default function Routing() {
  // const location = useLocation()
  // let currentpath = location.pathname
  // console.log(currentpath)
    return (

      <Routes>
        <Route path='/' element={<Suspense fallback={<Loader />}> <Landing /></Suspense>} />
      <Route path='/why-esds' element={<Suspense fallback={<Loader />}> <Whyesds /></Suspense>} />
      <Route path='/about-esds' element={<Suspense fallback={<Loader />}><AboutUs /></Suspense>} />
      <Route path='/navbar' element={ <Suspense fallback={<Loader />}><NavbarInner /></Suspense>} />
      <Route path='/cloud-services' element={ <Suspense fallback={<Loader />}><Cloud /></Suspense> } />
      
      <Route path="/private-cloud-services" element={<PrivateCloud/>}></Route>
      <Route path="/enterprise-cloud-services" element={<EnterpriesCloud/>}></Route>
      <Route path="/bfsi-cloud-services" element={<BFSICloud/>}></Route>
      <Route path="/government-cloud-services" element={<GovernmentCloudServices/>}></Route>
      <Route path="/leadership" element={<Leadershiptwo/>}></Route>
      <Route path="/certificate" element={<Certificate/>}></Route>
      <Route path="/soc-services" element={<SOCservices />} />
      {/* <Route path='/cloud-services/:cloud_name' element={<Suspense fallback={<Loader />}><Cloud /></Suspense> } /> */}
      <Route path='/colocation-data-centre-services' element={<Suspense fallback={<Loader />}><Colocation /></Suspense> } />
      {/* <Route path='/colocation-data-centre-services/:city' element={ <Suspense fallback={<Loader />}><Colocation /></Suspense>} /> */}
      <Route path='/managed-services' element={<Suspense fallback={<Loader />}> <ManageSecuServices /></Suspense>} />
      {/* <Route path='/managed-services/:MS_name' element={ <Suspense fallback={<Loader />}><ManageSecuServices /></Suspense>} /> */}
      <Route path='/contact-us' element={ <Suspense fallback={<Loader />}><ContactPage /></Suspense>} />
      <Route path='/soc-as-a-service' element={ <ManageSecurity />} />
      {/* <Route path='/soc-as-a-service/:managed' element={ <Suspense fallback={<Loader />}><ManageSecurity /></Suspense>} /> */}
      <Route path='/software-as-a-service' element={<Suspense fallback={<Loader />}> <Saas /></Suspense>} />
      {/* <Route path='/software-as-a-service/:Saas_name' element={ <Suspense fallback={<Loader />}><Saas /></Suspense>} /> */}
      <Route path='/platform-as-a-service' element={ <Suspense fallback={<Loader />}><Paas /></Suspense>} />
      {/* <Route path='/platform-as-a-service/:services' element={ <Suspense fallback={<Loader />}><Paas /></Suspense>} /> */}
      <Route path='/investors' element={<Suspense fallback={<Loader />}> <AnnualReports /></Suspense>} />
      <Route path='/whitepapers' element={<Suspense fallback={<Loader />}> <WhitePapers /></Suspense>} />
     
      <Route path='/thankyou' element={ <ThankYou />} />
      <Route path='*' element={ <Suspense fallback={<Loader />}><NotFound /></Suspense>} />
    </Routes>

    

    
    )
}