import React, { Component } from 'react'
import { List, Item } from 'semantic-ui-react'
import { Translate } from 'react-localize-redux'
import LogoFooterImage from '../../images/vp-ai-wordless.png'
import helpIcon from '../../images/icon-help.svg';
import TwitterIcon from '@material-ui/icons/Twitter';
import languagesIcon from '../../images/icon-languages.svg';
import LanguageToggle from './LangSwitcher';


import styled from 'styled-components'

import { makeStyles } from '@material-ui/core/styles'

// Material UI Imports
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        bottom: '0px',
        width: '100%',

        backgroundColor: '#f8f8f8',

        fontSize: '12px',
        fontWeight: '300',
        color: '#999999',

        marginBottom: '5px',
        marginLeft: '0px',
        marginTop: '5px'
    },
    logo: {
        width: '75px',
        paddingLeft: '14px',
        opacity: '0.6'
    },

    contentA: {
                fontSize: '12px',
                fontWeight: '300',
                color: '#999999',
                textDecoration: 'underline'
    },

    colorbrowngrey: {
                color: '#e6e6e6',
                padding: '0 6px',
    }   
}));

const FooterGrid = styled(Grid)`
    &&&& {
        position: absolute;
        bottom: 0px;
        width: 100%;

        background-color: #f8f8f8;

        font-size: 12px;
        font-weight: 300;
        color: #999999;

        margin-bottom: 0px;
        margin-left: 0px;

        .near-logo {
            .content {
                a {
                    font-size: 12px;
                    font-weight: 300;
                    color: #999999;
                    text-decoration: underline;

                    :hover {
                        text-decoration: none;
                    }
                }
                .color-brown-grey {
                    color: #e6e6e6;
                    padding: 0 6px;
                }
            }
            .image {
                width: 75px;
                padding-left: 14px;
                opacity: 0.6;
            }
           
        }

        .learn-more {
            padding: 0 40px 0 0;
            color: #24272a;
        }

        .help {
            padding-right: 0px;
            padding-top: 10px;
            padding-bottom: 10px;

            > .list {
                width: 230px;
                height: 80px;
                padding: 20px 0;
                background: #f8f8f8;
                text-align: left;

                > img {
                    width: 80px;
                    position: absolute;
                    bottom: 0px;
                    right: 200px;
                }

                > h3 {
                    font-weight: 600 !important;
                    padding: 0 0 0 40px;
                    color: #999999 !important;

                    &.color {
                        color: #0072ce !important;
                    }
                }
            }
        }
    }

    @media screen and (max-width: 991px) {
        &&&& {
            &:not(.show-mobile) {
                display: none;
            }
        }
    }

    @media screen and (max-width: 767px) {
        &&&& {
            height: 180px;

            .near-logo {
                .content {
                    text-align: center;
                }
                .image {
                    padding-left: 0px;
                }
            }
        }
    }
`

const Help = styled.a`
    display: flex;
    align-items: center;
    margin-left: auto;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 2px;
    padding-top: 2px;
    
    &:hover {
        color: grey;
        text-decoration: none;
    }

    &:before {
        content: '';
        background: url(${helpIcon});
        background-repeat: no-repeat;
        display: inline-block;
        width: 23px;
        height: 23px;
        margin-right: 10px;
        margin-top: -2px;
    }
`


const Lang = styled.div`
    margin-left: 20px;
    position: relative;
    background-color:#d5d5d5;

    &:after {
        content: '';
        border-color: #f8f8f8a1;
        border-style: solid;
        border-width: 2px 2px 0 0;
        display: inline-block;
        position: absolute;
        right: 10px;
        top: calc(50% - 10px);
        transform: rotate(135deg) translateY(-50%);
        height: 9px;
        width: 9px;
    }

    &:last-child {
        margin-right: 15px;
    }

    .lang-selector {
        appearance: none;
        background: transparent url(${languagesIcon}) no-repeat 5px center / 20px 20px;
        border: 0;
        cursor: pointer;
        font-size: 16px;
        height: 32px;
        outline: none;
        padding-right: 54px;
        position: relative;
        user-select: none;
        width: 54px;
        z-index: 1;

        &::-ms-expand {
            display: none;
        }
    }
   
`

const MobileSpacer = styled.div`
    height: 180px;
    margin-top: 20px;

    @media (min-width: 768px) {
        display: none;
    }
`

export default function Footer(props) {

    const classes = useStyles()

    function showMobileFooter() {
        const noFooterRoutes = ['login', 'send-money', 'sign'];
        const currentRoute = window.location.pathname.replace(/^\/([^/]*).*$/, '$1');
        return !noFooterRoutes.includes(currentRoute);
    }

    
        return (
            <>
           
            <Grid container justify="space-between" alignItems="center" className={classes.root}>
                <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Item.Group className='near-logo'>
                        <Item>
                            <Item.Image src={LogoFooterImage} className={classes.logo} style={{width: '75px', marginTop:'5px', marginBottom:'5px', marginLeft:'5px'}}/>
                            <Item.Content>
                                <div style={{marginBottom: '5px'}} />
                                <Translate id='footer.intro'/>
                                <div style={{marginBottom: '15px'}} />
                                {new Date().getFullYear()} <Translate id='footer.copyrights' />
                                <br />
                                <a href='/'><Translate id='footer.termsOfService' /></a>
                                <span className='color-brown-grey'>|</span>
                                <a href='/'><Translate id='footer.privacyPolicy' /></a>
                            </Item.Content>
                        </Item>
                    </Item.Group>
                </Grid>
                <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <div style={{textAlign:'center'}}>
                        <Translate id='footer.desc' /> <a href='https://vitalpoint.ai/'>
                        <Translate id='footer.learnMore' /></a>
                    </div>
                </Grid>
                <Grid item xs={12} sm={12} md={1} lg={1} xl={1}>
                    <div style={{float:'right'}}>
                    <Help href='https://discord.gg/YRD8GWQ' target='_blank' rel='noopener noreferrer'>
                        <Translate id='link.help'/>
                    </Help>
                    <Lang>
                        <LanguageToggle />
                    </Lang>
                    </div>
                </Grid>
            </Grid>
               
            </>
        )
    }
