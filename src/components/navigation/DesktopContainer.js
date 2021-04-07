import React, { useState, useEffect } from 'react';
import { Translate } from 'react-localize-redux';
import styled from 'styled-components';
import helpIcon from '../../images/icon-help.svg';
import userIcon from '../../images/user-icon-grey.svg';
import languagesIcon from '../../images/icon-languages.svg';
import LanguageToggle from '../common/LangSwitcher';
import Logo from './Logo';
import NavLinks from './NavLinks';
import TopNavLinks from './TopNavLinks'
import LeftSideDrawer from './LeftSideDrawer';
import UserBalance from './UserBalance';
import UserName from './UserName';
import DesktopMenu from './DesktopMenu';

//import Avatar from '../common/Avatar/avatar'
import Avatar from '@material-ui/core/Avatar'
import { makeStyles } from '@material-ui/core/styles'

// Material UI Imports
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      margin: 'auto',
      maxWidth: 325,
      minWidth: 325,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
}));
  

const Container = styled.div`
    display: none;
    color: white;
    position: relative;
    font-size: 14px;
    margin-bottom: 20px;
    padding-left: 0px;
    box-shadow: 0px 5px 9px -1px rgba(0,0,0,0.17);

    @media (min-width: 992px) {
        display: flex;
    }

    background-color: #24272a;
    height: 70px;
    align-items: center;

    img {
        width: 180px;
    }

    .click-outside {
        position: relative;
    }
`


const User = styled.div`
    border-left: 2px solid #5d5f60;
    position: relative;
    min-width: 150px;
    max-width: 310px;
    margin-left: 20px;
    padding: 0 50px 0 20px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;

    @media (min-width: 1050px) {
        max-width: 355px;
    }

    @media (min-width: 1200px) {
        max-width: 425px;
    }

    @media (min-width: 1350px) {
        max-width: 500px;
    }

    @media (min-width: 1350px) {
        max-width: 650px;
    }

    @media (min-width: 1500px) {
        max-width: 700px;
    }

    .user-name {
        white-space: nowrap;
        margin-left: 10px;
        max-width: 100px;

        @media (min-width: 769px) {
            max-width: 125px;
        }

        @media (min-width: 1050px) {
            max-width: 170px;
        }

        @media (min-width: 1200px) {
            max-width: 215px;
        }

        @media (min-width: 1350px) {
            max-width: 255px;
        }

        @media (min-width: 1500px) {
            max-width: 295px;
        }
    } 

    .user-balance {
        margin-left: 10px;
        white-space: nowrap;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: black;
        padding: 2px 10px;
        border-radius: 40px;
        font-size: 14px;

        @media (min-width: 1200px) {
            max-width: 110px;
        }

        @media (min-width: 1350px) {
            max-width: 155px;
        }
    }

    @media (max-width: 920px) {
        flex-direction: column;
        align-items: flex-start;
    }

    &:after {
        content: '';
        border-style: solid;
        border-width: 2px 2px 0 0;
        display: inline-block;
        position: absolute;
        right: 25px;
        top: calc(50% - 10px);
        transform: rotate(135deg) translateY(-50%);
        height: 9px;
        width: 9px;
    }
`

const AvatarIcon = styled.div`
    display: none;
    min-width: 35px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: #545454;

    @media (min-width: 940px) {
        display: inline-block;
    }
`

const imageName = require('../../images/default-profile.png') // default no-image avatar

export default function DesktopContainer(props) {
 
        const [thisAvatar, setThisAvatar] = useState()
        const [loaded, setLoaded] = useState(false)

        const {
            account,
            menuOpen,
            toggleMenu,
            availableAccounts,
            selectAccount,
            showNavLinks,
            curUserIdx,
            avatar
        } = props;

        const classes = useStyles()

        useEffect(() => {

            async function fetchData() {
              
               if(avatar){
                   setThisAvatar(avatar)
               } else {
                   setThisAvatar(imageName)
               }
            }
           
            fetchData()
              .then((res) => {
                console.log('res', res)
                // handleLoaded(true)
              })
            }, [curUserIdx, avatar]
        )

        const handleLoaded = (property) => {
            setLoaded(property)
        }

        return (           
            <Paper className={classes.paper}>
            <Grid container justify="space-between" alignItems="center" >
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
                {showNavLinks && <LeftSideDrawer
                    account={account}
                    selectAccount={selectAccount}
                    availableAccounts={availableAccounts}
                    menuOpen={menuOpen}
                    toggleMenu={toggleMenu}
                    showNavLinks={showNavLinks}
                />}
                    <Logo />
              
                </Grid>
                <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                    <Typography>LEARN</Typography>
                </Grid>
                <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
                    <Typography>EXPLORE</Typography>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                {showNavLinks &&
                    <>  
                        <User onClick={toggleMenu}>
                          
                                <Avatar src={thisAvatar} />
                           
                            <UserName accountId={account.accountId}/>
                            <UserBalance balance={account.balance}/>
                        </User>
                        <DesktopMenu
                            show={menuOpen}
                            toggleMenu={toggleMenu}
                            account={account}
                            accountId={account.accountId}
                            accounts={availableAccounts}
                            selectAccount={selectAccount}
                            hasLockup={account.hasLockup}
                        />
                    </>
                }
                </Grid>
            </Grid>
            </Paper>
        )
    }