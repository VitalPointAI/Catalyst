import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Footer from '../common/Footer/footer'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import systemInteractions from '../../img/system-interactions.png'
import Catalyst from '../../img/catalyst-by-vpai.png'
//material UI components 
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
    top: {
        background: 'linear-gradient(60deg, #ffcc99, #ff6600)',
        height: '200px',
        margin: 0,
        minWidth: '100%',
        padding: 0,
    },
    titletext:{
        fontWeight: 700,
        textAlign: 'center',
        paddingTop: "112px", 
    },
    header2: {
        fontWeight:500,
        fontSize: '24px',
        textAlign: 'center', 
    },
    text: {
        fontSize: '20px', 
    },
    paper: {
        maxWidth: '100%',
    },
    image1:{
        maxWidth: '100%'
    }
}));

const NearStory = () => {
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()
    return(
    <>
    <Header state={state}></Header>
    <div className={classes.top}><h1 className={classes.titletext}>How NEAR uses Catalyst to<br /> Fund Community Projects</h1></div>
    <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{paddingLeft: '10%',
     paddingRight: '10%', paddingTop: '4%', paddingBottom: '4%'}} >
       <Grid item xs={12}>
       <Typography className={classes.text}> 
            NEAR protocol is a platform for building decentralized application on the blockchain quickly, and the NEAR community fund is a way for the NEAR team to fund interesting projects built on their platform. It enables any one person, or organization to submit their project idea for review, and should it be approved, receive funds to facilitate work on the project. This helps to foster the NEAR ecosystem by expanding the number of projects built on the protocol.
            <br /> <br />
            <span className={classes.header2}>Considering Factors </span><br /> <br />
            When selecting a way to organize this system, there were a few things to consider. NEAR needed a council comprised of members from their team to decide how funds would be allocated, as well as some way to gauge the community interest in proposed projects, all while using a system that was decentralized, and easy for new users to wrap their heads around.  <br /> <br />
            Additionally, the question of identity kept arising. Using a typical DAO to organize the community fund would force the team to scrap identity in favour of decentralization which wasn’t be an option for regulatory purposes. But deciding to use a more traditional forum would forfeit their ability to maintain decentralization for the fund, which was also problematic.  <br /> <br />
            <span className={classes.header2}>How Catalyst Ticked All the Boxes </span><br /> <br />
            Catalyst is an application built on NEAR for quickly constructing decentralized communities, and the default community on Catalyst is plutocratic, meaning that the more NEAR a member contributes to the fund, the more voting shares they receive upon being approved. Because the NEAR community fund is a pool governed by the council, so long as the majority of the funds came from them, they are able to retain ultimate deciding power over which projects are funded, and which aren’t.  <br /> <br /> 
        </Typography>
        </Grid>
        <Grid container alignItems="center" justifyContent="space-between" spacing={3}>
        <Grid item xs={7}>
        <Typography className={classes.text}>
            However, an important feature introduced through the use of a Catalyst community is the ability for other members of the community to vote on project proposals as well. This allows the potential for the community to decide whether a project should be funded when council members disagree and -- most importantly -- lets the NEAR team see an exact metric denoting community support for a particular project.  <br /> <br />
            Then comes the question of managing identity and decentralization simultaneously, and Catalyst’s solution: Personas. Catalyst has a system for managing decentralized identities called Personas, which lets users create rich identities for themselves with photos, names, and other relevant information, all stored using Ceramic. This voided the concern over balancing the need for decentralization with identity, and introduced a decentralized option that was in line with a more typical web experience, albeit with improvements. 
            <br /> <br />
        </Typography>
        </Grid>
        <Grid item xs={5}>
            <Paper className={classes.paper}>
            <img className ={classes.image1} src={Catalyst} />
                <Typography style={{paddingLeft: '10%'}} className={classes.text}>
                        <CheckCircleOutlineIcon /> 	Decentralized <br />
                        <CheckCircleOutlineIcon />	Rich Identities <br />
                        <CheckCircleOutlineIcon /> 	User Friendly <br />
                        <CheckCircleOutlineIcon /> 	Self Organized <br />
                        <CheckCircleOutlineIcon /> 	Flexible  <br />
                        <br /> 
                  </Typography> 
               </Paper>
            </Grid>
        </Grid>
        <Grid item xs={12}>
        <Typography className={classes.text}> 
            <span className={classes.header2}>A Funding Example </span>
            <br /> <br />
            The process of proposing a project, and receiving funds through the NEAR community fund is extremely simple. 
            <br />
            <br /> 1. The to-be member first must create a Persona with all of the necessary information required by the NEAR Community Fund. 
            <br /><br />  2. They then need to head over to the Catalyst community where they can open a membership proposal. This proposal lets the user add information as they see fit to make their case, and includes a field where they can add a contribution of NEAR relative to the amount of voting shares they would like to receive within the community. The NEAR community then votes on that proposal. <br /> <br />
           
            3. Once someone is a member, they can submit a funding commitment proposal. This is the proposal where they include a description of their project, and the amount of funding that they wish to receive for the project. They must then wait for another member to sponsor their proposal before it moves to the voting phase. <br /> 
           
            <br /> 4. Once the community votes on the funding commitment proposal, if it passes, then the amount of funds described in the proposal is set aside in an escrow account while the team or individual works on the project. <br /> 
           
            <br />5. When the member has completed their work, they submit a payout proposal, where they include the work they have accomplished, and the community then votes on whether it satisfies the original terms of the funding commitment. If the payout proposal passes, the funds placed in escrow after the funding commitment proposal are transferred to the account that completed the project. Simple as that. <br /> <br />
            
       </Typography>
       <Grid item xs={12}>
            <img className ={classes.image1} src={systemInteractions} />
       </Grid>
       </Grid>
    </Grid>
    <Footer/>
    </>
    )
}

export default NearStory 