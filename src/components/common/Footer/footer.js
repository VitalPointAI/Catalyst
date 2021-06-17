import React from 'react'
import { Link } from 'react-router-dom'
import ImageLoad from '../ImageLoad/imageLoad'
import catalystbyvpLogo from '../../../img/catalyst-by-vpai.png'
import vitalPointAILogo from '../../../img/vp-ai-wordless.png'
import './footer.css'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'

const Footer = ({}) => {
    const matches = useMediaQuery('(max-width:500px)')

    return (
    !matches ? 
        <div className="footer">
            <div className="left">
                <a href="https://vitalpoint.ai">
                    <ImageLoad image={vitalPointAILogo} style={{height: "4em", marginTop: '8px'}} />
                </a>
            
                <div className="footertext">
                <Typography variant="body2" style={{fontSize: '90%'}}>A Vital Point AI project.<br></br>
                    Powering augmented cognition<br></br>
                    with blockchain, data and MR.</Typography>
                
                </div>
            </div>
            <div align="center">
                <Link to="/">
                <ImageLoad image={catalystbyvpLogo} style={{height: "6em", marginLeft: '-90px'}} />
                </Link>
            </div>
            <div className="footerright">
            <Typography variant="body2" style={{fontSize: '90%'}}><a href="https://vitalpoint.ai">© 2020 Vital Point AI</a><br></br>
                All Rights Reserved.<br></br>
                <span className="blue">Privacy Policy  <span className="black"> | </span>  Terms of Use</span></Typography>
            </div>
        </div>
        :
        <div className="footer-mobile">
        <div className="left">
            <a href="https://vitalpoint.ai">
                <ImageLoad image={vitalPointAILogo} style={{height: "4em", marginTop: '8px'}} />
            </a>
        
            <div className="footertext">
                <Typography variant="body2" style={{fontSize: '90%'}}>A Vital Point AI project.<br></br>
                Powering cognition<br></br>
                with blockchain, data and MR.</Typography>
            
            </div>
        </div>
        <div className="footerright">
        <Typography variant="body2" style={{fontSize: '90%'}}><a href="https://vitalpoint.ai">© 2020 Vital Point AI</a><br></br>
            All Rights Reserved.<br></br>
            <span className="blue">Privacy<span className="black"> | </span>TOS</span></Typography>
        </div>
        </div>
    )
}

export default Footer