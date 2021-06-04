import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import { Header } from '../Header/header'
import Footer from '../common/Footer/footer'


//material UI components 
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
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
        paddingTop: "112px", 
    },
    header2: {
        fontWeight:500,
        fontSize: '24px',
    },
    text: {
        fontSize: '20px', 
    }
}));

const ArtStory = () => {
    const { state, dispatch, update } = useContext(appStore)
    const classes = useStyles()
    return(
    <>
    <Header state={state}></Header>
    <div className={classes.top}><h1 className={classes.titletext}>How Karen Built <br /> a Thriving Art Community</h1></div>
    <Grid container alignItems="center" justify="space-between" spacing={0} style={{paddingLeft: '10%', paddingRight: '10%',
     paddingTop: '4%', paddingBottom: '4%'}}>
       
       <Typography className={classes.text}> 
                Karen is a watercolour artist who picked up a brush seriously for the first time after her kids moved out of the house. Discovering she had a talent, she began posting her paintings online under the moniker watercolourmama, and began to garner a following. 
                <br /> <br />
                <span className={classes.header2}>Developments</span>
                <br /> <br />
                As time passed Karen began to receive more and more comments and messages from her community members requesting a way to purchase pieces of her art. In response to this, she decided to sell her pieces in an NFT marketplace. However, this left her with three remaining problems. She didn’t know:
                <br /> <br />
                1.	what her community wanted her to paint.<br />
                2.	how many of each piece she should mint.<br />
                3.	how to keep her community engaged.<br /><br />
                
                This is when she discovered that Catalyst presented a solution to her problems.  
                <br /> <br />
                <span className={classes.header2}>How Karen uses Catalyst</span>
                <br /> <br />
                Catalyst allows Karen the ability to set up a community where she can submit proposals for different art projects she has in mind, and then allow her community to vote on which ones they’d like the chance to purchase. The proposals that pass get made, and listed, while the ones that don’t are scrapped.  <br /> <br /> 
                The response to these proposals then let Karen know exactly the number of members in her community that are interested in a piece before she lists it, and allows her to set the correct amount of NFTs to mint, as well as the best price to set them.  <br /> <br />
                The Catalyst community also lets members other than Karen introduce their own ideas, which can be voted on by the community as well, and bring to light subjects that her community would like to see, but she had never thought of painting herself. In this case, members who submit an idea are given the option to associate a funding amount with it. This means that if their idea is selected, then they will be compensated for that idea with the amount that they selected from the pool of community funds. However, they also have the option to specify zero as the funding amount if they wish to give away their idea for free.  <br /> <br /> 
                Importantly, Catalyst also prevents members of her community form spamming proposals by using a deposit-based system whereupon members must submit 10 NEAR in order to submit a proposal. This deposit is returned when the proposal is finished being processed, regardless of whether it passes, but makes the prospect of creating many simultaneously an extremely expensive endeavour.  <br /> <br />
                Additionally, through the flexible, plutocratic setup of Catalyst communities, Karen always maintains more than fifty percent of the total voting power within her community, meaning she has the power to remove or revoke entrance to any particular member or membership proposal, which is important for the moderation of her community. This configuration also lets her have ultimate say over what she paints, which is important to her.  <br /> <br />
                <span className={classes.header2}> Karen’s Community in Action </span>
                <br /> <br />
                1. To-be members first submit member proposals that are reviewed by Karen and the community, and then pass or fail depending on whether or not they receive enough votes. <br /> <br />
                2. Then, members can view the list of proposals that Karen and other members have submitted for future art pieces, and vote on the ones they would like to see sold as NFT’s. These proposals will either be in the voting section, if voting has already begun, or they will be waiting to be sponsored by some other member, whereupon they will also enter the voting section. <br /> <br />
                3. If a member wishes to submit their own idea, they create a funding commitment proposal explaining their idea, along with the amount they would like in exchange for use of the concept. This proposal is then voted on by the community, and If it passes, the amount is set aside. Once Karen is done painting the piece, the member with the original idea can then submit a payout proposal, which links to the piece using their idea, and the community can vote to release the funds to them. <br /> <br />
                <span style={{fontWeight: 550}}>Note.</span> The reason funds aren’t released upon the first vote is to retain Karen’s autonomy, and allow her the choice to change her mind at any point in the process. Therefore, it prevents any member from being paid for an idea that never came to fruition. 

       </Typography>
    </Grid>
    <Footer/>
    </>
    )
}

export default ArtStory 