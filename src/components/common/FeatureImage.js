import React from 'react'
import PropTypes from 'prop-types'

import FeatureImage from '../../images/earth-network.png'

import styled from 'styled-components'

import CheckImage from '../../images/icon-check.svg'
import DenyImage from '../../images/icon-deny.svg'

const CustomDiv = styled(`div`)`
    &&& {
        border: 1px solid #e6e6e6;
        background: #fff;
        border-radius: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.tiny {
            width: 26px;
            height: 26px;

            img {
                width: 16px;
            }
        }

        &.small {
            border: 0px;
            background: #e6e6e6;
            width: 32px;
            height: 32px;

            img {
                width: 22px;
            }
        }
        &.medium {
            border: 0px;
            background: #e6e6e6;
            width: 48px;
            height: 48px;

            img {
                width: 30px;
            }
        }
        &.big {
            border: 0px;
            background: #e6e6e6;
            width: 72px;
            height: 72px;

            img {
                width: 48px;
            }
        }
        &.huge {
           // border: 0px;
        
            width: 95%;
            height: 95%;

            img {
                max-width: 75%;
                margin: auto;
                
            }
        }

        > div {
            position: absolute;
            width: 120%;
            height: 120%;
            border-radius: 100%;
            
        }

        &.ready > div {
            border: 2px solid #5ace84;
        }
        &.success > div {
            background: #fff url(${CheckImage});
        }
        &.problem > div {
            background: #fff url(${DenyImage});
        }


        &.success, &.problem {
            > img {
                opacity: 0.1;
            }
        }
        &.dimmed {
            opacity: 0.2;
        }

    }
`

const FeaturedImage = ({ 
    src, 
    size = 'huge' ,
    type
}) => (
    <CustomDiv className={`${size} ${type}`}>
        <img src={FeatureImage} alt="feature" />
    </CustomDiv>
)

FeaturedImage.propTypes = {
    src: PropTypes.string,
    size: PropTypes.string
}

export default FeaturedImage
