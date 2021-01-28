import React from 'react'
import { Translate } from 'react-localize-redux'
import styled from 'styled-components'
import LandingBackground from './LandingBackground'
import FormButton from '../common/FormButton'
import FeaturedImage from '../common/FeatureImage'

import Grid from '@material-ui/core/Grid'

const StyledContainer = styled.div`

    &&& {
        margin: 35px 5px 0 5px;
        position: relative;
      //  text-align: center;

        @media (max-width: 767px) {
            margin: 0;
            overflow: hidden;
            margin-top: -13px;
        }

        svg {
            opacity: 0.4;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            z-index: -1;

            @media (max-width: 992px) {
                top: -120px;
            }

            @media (max-width: 470px) {
                top: -86px;
                width: 900px;
                left: unset;
            }
        }

        .small-centered {
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        h1 {
            font-weight: 600;
        }

        h3 {
            font-weight: 400 !important;

            span {
                span {
                    font-weight: 500;
                }
            }
        }

        .buttons {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1;

            .blue {
                font-weight: 500 !important;
                letter-spacing: normal;
                margin: 0;
                text-transform: none;

                :not(.link) {
                    min-width: 200px;
                    max-width: 220px;
                    height: auto;
                    text-transform: none;
                    padding: 12px 6px;
                }
            }

            .link {
                text-decoration: none;
                padding: 0;
                :hover {
                    background-color: transparent;
                    text-decoration: underline;
                }
            }

            span {
                margin: 20px;
            }

            @media (min-width: 768px) {
                flex-direction: row;
            }
        }

        .img-wrapper {
            min-height: 300px;

            @media (min-width: 768px) {
                min-height: 600px;
            }
        }

        img {
            margin-top: 65px;
            margin-bottom: 50px;
            width: 500px;
            height: auto;

            @media (min-width: 768px) {
                width: 675px;
                margin-bottom: 75px;
            }
        }

        .email-subscribe {
            margin-top: -140px;
            margin-bottom: 50px;
            padding-top: 80px;

            @media (max-width: 767px) {
                margin-bottom: 0;
                margin-top: -100px;
            }
        }
    }
`

export function GuestLanding() {
    return (
        <>
       <StyledContainer>
            <Grid container alignItems="left" justify="space-evenly" spacing={1}>
                <Grid item xs={12} sm={12} md={1} lg={1} xl={1} ></Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                    <h1><Translate id='landing.what' /></h1>
                    <h3><Translate id='landing.answer' /></h3>
                    <div className='buttons'>
                        <FormButton linkTo='/create'><Translate id='button.createPersona' /></FormButton>
                        <span><Translate id='landing.or' /></span>
                        <FormButton linkTo='/recover-account' className='link'><Translate id='button.importPersona' /></FormButton>
                    </div>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} >
                    <FeaturedImage />      
                </Grid>
                <Grid item xs={12} sm={12} md={1} lg={1} xl={1} ></Grid>
            </Grid>
        
          
        </StyledContainer>
        
        
        
        
        </>
    )
}