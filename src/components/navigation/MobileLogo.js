import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
//import NearLogo from '../svg/NearLogo';
import FleetsLogo from '../../images/fleets-mobile.png'

const StyledLogo = styled(Link)`
    margin-top: 5px;

    @media (max-width: 991px) {
        max-width: 53px;
        overflow: hidden;
        margin-left: -10px;
        margin-top: 2px;
    }

    img {
        width: 50px;
    }
`

const MobileLogo = () => (
    <StyledLogo to='/' className='logo'>
        <img src={FleetsLogo} alt="Fleets Logo"/>
    </StyledLogo>
)

export default MobileLogo;