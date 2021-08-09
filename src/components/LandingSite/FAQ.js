import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Footer from '../common/Footer/footer'

// Material UI Components
import { makeStyles } from '@material-ui/core'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'


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
        paddingTop: "150px", 
    }
}));

const FAQ = () => {
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()
    return(
        <>
        <Header state={state}></Header>
        <div className={classes.top}><h1 className={classes.titletext}>Frequently Asked Questions</h1></div>
        <Grid container alignItems="center" justifyContent="space-between" spacing={0} style={{padding: '20px'}} >
            <Accordion>
                <AccordionSummary>  
                    <Typography>
                        What is Catalyst?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Catalyst is a platform that allows anyone to create a community completely controlled by its members with the click of the button. Blockchain technology introduces the possibility for incorruptible communities, and Catalyst introduces a way for you to easily make your own!
                    </Typography>
                </AccordionDetails> 
            </Accordion>
            <Accordion>
                <AccordionSummary>  
                    <Typography>
                        What is NEAR?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    NEAR is a platform which allows developers like us to build projects like Catalyst on the blockchain, so that you can enjoy all of the benefits, without having to dramatically change the way you use the web or learn fancy new technologies (unless you want to 😊). 
                    <br />
                    <br />
                    NEAR is also the name of a cryptocurrency that runs on the NEAR blockchain. This token can be traded, and exchanged within Catalyst communities. 
                    </Typography>
                </AccordionDetails> 
            </Accordion>
            <Accordion>
                <AccordionSummary>  
                    <Typography>
                    Why is it important that Catalyst operates on the blockchain? 
                    </Typography>
                </AccordionSummary>  
                <AccordionDetails>
                    <Typography>
                    Transparency! When you create a community on Catalyst, the rules dictating how that community will run are coded on the NEAR blockchain. This means that any action not in accordance with the chosen rules will fail to be execute, without exception. Plus, since everything on the blockchain is public, and unable to be changed, there is no way to change those rules without being noticed. Not even we can alter the rules once they’ve been set, leaving all of the control with the community from that point forward, allowing for the elimination of centralized authority. 
                    <br />
                    <br />
                    Because of this distinction, Catalyst communities are considered decentralized autonomous organizations, or DAOs for short.  
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    What is a Persona? 
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Personas are individual identities you can create for yourself. Think of how one might act different with their boss or parents than around their best friend, or partner; the introduction of Personas allows you to do something similar within Catalyst communities. By allowing you to create these sub-accounts, we are letting you curate which information is shared with each community. 
                    <br />
                    <br />
                    Maybe you want to be referred to as your legal name within a professional community, and your gamertag within a community dedicated to gaming. Alternatively, perhaps you want to include your phone number with your information in one community, and not another. Personas allow you to have this freedom. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    What makes a Persona unique from a regular account on other websites?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Personas are decentralized identities (known as DIDs) hooked up to your NEAR wallet. This means that your identity is proved once, and that verification is stored on the blockchain. Therefore, your Personas could be accessible by a variety of services built on NEAR, without repeated verification. Imagine changing your email address and being able to update it for every Persona enabled application you’ve shared it with simultaneously, and securely. We are confident Personas will continue to be integrated into more decentralized applications, expanding their usefulness over time. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Are Personas secure?    
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    They are! In fact, they are more secure than most modern web accounts. Catalyst, and by extension, your Personas are interconnected with your NEAR wallet, meaning that the only way to gain access to them is to gain access to your physical device, or the seed phrase issued on the creation of your wallet.   
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Why is there no login page?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Once you connect Catalyst to your NEAR wallet, there is never a need to login on that device again. When your NEAR wallet authenticates Catalyst, it generates a key which is stored in your browser, and allows access to the application anytime you visit on that browser. Should you switch browsers, or computers, you will need to login again using your NEAR wallet. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    How do I join a community?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    In order to join and participate within a community, you must submit a membership proposal. This proposal pleads your case for entrance into that community, and allows you to set a contribution amount that will be donated to the community fund should your proposal be approved. This contribution amount determines how much influence you will have within the community if your membership proposal is approved, working out to 1 voting share for every 1 NEAR contributed. The community is then given a period upon which they can vote on your membership proposal. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Why does Catalyst use NEAR for exchange within communities?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Since Catalyst was built on the NEAR chain, using NEAR as the token to be used within communities was the natural choice. However, you are always free to exchange your NEAR for other crypto or fiat currencies outside of Catalyst as you wish.
                    <br/>
                    <br/>
                    More options related to the variety of tokens will likely appear in the future. In particular, we are looking into the ability for a community to introduce its own token. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Why does this proposal cost more than I contributed? 
                    </Typography>
                </AccordionSummary> 
                <AccordionDetails>   
                    <Typography>
                    When creating a community, a deposit amount can be set by the creator. This prevents the spamming of proposals in the DAO, as it would become extremely expensive to do so. However, unlike a contribution, this amount will be returned to you once the proposal is processed, regardless of whether or not it is approved.  
                    </Typography>
                </AccordionDetails>
            </Accordion>
                
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Can funds be exchanged safely within communities?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Of course! Catalyst communities allow for a trust-less exchange of currency. What does this mean? When transferring funds to someone in exchange for a service, those funds will be placed in an escrow account for safekeeping until that service is delivered. This means the community need not trust the member they are paying, and that member doesn’t need to trust that they will be paid. 
                    <br/>
                    <br/>
                    You might be wondering, then, who decides whether or not the service has been adequately delivered? The answer to this is -- as always with Catalyst -- the community. This entire process is accomplished through a series of proposals, which are voted on in accordance with the communities rules, a more detailed example can be seen here: xxx link to example xxx. 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Where do you keep our data?
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Everywhere! In order to maintain decentralization, all of the data for Catalyst is sliced up and dispersed among many different computers all over the world. This means that it isn’t congregated on one central server, under the control of some hopefully benevolent overlord, as is the case with most data today. Catalyst accomplishes this through the use of Ceramic, which you can read more about on their website <a href="https://ceramic.network/">here</a> 
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary>
                    <Typography>
                    Isn’t the blockchain bad for the environment? 
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                    Not necessarily! NEAR Protocol -- which Catalyst runs on -- is entirely carbon neutral. You can read more about it  <a href='https://near.org/blog/near-climate-neutral-product/'>here</a>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Grid>
        <Footer/>
        </>
    )
}

export default FAQ