import React from 'react'
import { Link } from 'react-router-dom'
import ImageLoad from '../ImageLoad/imageLoad'
import catalystbyvpLogo from '../../../img/catalyst-by-vpai.png'
import vitalPointAILogo from '../../../img/vp-ai-wordless.png'
import './footer.css';

const Footer = () => (
    <div className="footer">
        <div className="left">
            <a href="https://vitalpoint.ai">
                <ImageLoad image={vitalPointAILogo} style={{height: "5em", marginTop: '3px'}} />
            </a>
           
            <div className="footertext">
                <p>A Vital Point AI project.</p>
                <p>Powering augmented cognition</p>
                <p>with blockchain, data and MR.</p>
               
            </div>
        </div>
        <div align="center">
            <Link to="/">
            <ImageLoad image={catalystbyvpLogo} style={{height: "6em", marginLeft: '-90px'}} />
            </Link>
        </div>
        <div className="footerright">
            <p><a href="https://vitalpoint.ai">© 2020 Vital Point AI</a></p>
            <p>All Rights Reserved.</p>
            <p className="blue">Privacy Policy  <span className="black"> | </span>  Terms of Use</p>
        </div>

    </div>
)

export default Footer