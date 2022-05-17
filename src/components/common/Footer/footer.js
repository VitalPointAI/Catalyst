import React from 'react'
import ImageLoader from '../ImageLoad/imageLoad'
import projectLogo from '../../../img/vitalpointai.png'
//import projectLogo from '../../../img/footer-vpai.png'
import powered from '../../../img/powered-by.png'
import './footer.css'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'

export default function Footer(props){

    const matches = useMediaQuery('(max-width:500px)')

    return (
        !matches ? 
            <div className="footer">
                <div className="left">
                    <a href="https://vitalpoint.ai" style={{color:'#FFFFFF'}}>
                        <ImageLoader image={projectLogo} style={{float: 'left', height: "3em", marginRight: '3px', marginTop: '7px'}} />
                    </a>
                    <a href="https://vitalpoint.ai" style={{color:'#FFFFFF'}}>
                        <Typography variant="body2" style={{fontSize: '90%', marginTop: '10px'}}>
                            Vital Point AI
                            Join us.
                        </Typography>
                    </a>
                </div>
                <div>
                    <ImageLoader image={powered} style={{height: "3em", marginTop: '8px'}} />
                </div>
               
                <div className="footerright">
                <Typography variant="body2" style={{fontSize: '90%'}}>Catalyst<br></br>Open source/as is.<br></br>
               No warranty of any kind.
                </Typography>
                </div>
            </div>
            :
            <>
            <div className="footer-mobile">
            <div className="left">
                <a href="https://vitalpoint.ai" style={{color:'#FFFFFF'}}>
                    <ImageLoader image={projectLogo} style={{float: 'left', height: "3em", marginRight: '3px', marginTop: '7px'}} />
                </a>
                <a href="https://vitalpoint.ai" style={{color:'#FFFFFF'}}>
                    <Typography variant="body2" style={{fontSize: '90%', marginTop:'10px'}}>
                        Vital Point AI
                        Join us.
                    </Typography>
                </a>
            </div>
            <div>
                <ImageLoader image={powered} style={{height: "3em", marginTop: '8px'}} />
            </div>
            <div className="footerright">
                <Typography variant="body2" style={{fontSize: '90%'}}>Catalyst<br></br>
                Open source/as is.<br></br>
                No warranty.
                </Typography>
            </div>
            </div>
            </>
        )
}