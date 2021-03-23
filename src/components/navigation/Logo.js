import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
//import NearLogo from '../svg/NearLogo';
import CatalystLogo from '../../images/catalyst-logo-cropped.png'

const StyledLogo = styled(Link)`
    margin-top: 5px;
    float:left;
    margin-left: 20px;

    @media (max-width: 991px) {
        max-width: 53px;
        overflow: hidden;
        margin-left: -10px;
        margin-top: 2px;
    }

    svg {
        width: 155px;
    }

    img {
        width: 200px;
    }
`

const Logo = () => (
    <StyledLogo to='/' className='logo'>
        <img src={CatalystLogo} alt="Catalyst Logo"/>
    </StyledLogo>
)

export default Logo;