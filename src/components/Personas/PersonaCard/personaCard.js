import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Image, Icon, Loader, Dimmer, Grid, Button } from 'semantic-ui-react'
import AvatarImage from '../../common/Avatar/avatar'
import './memberCard.css'

export default function PersonaCard(props) {

    const[loaded, setLoaded] = useState(true)

    const {
        personaId,
        personaAccount,
        personaCreatedDate,
        personaStatus,
        personaPrivacy
    } = props

    useEffect(
        () => {

        },
        []
    )

    // Format member join date as string with date and time for display
    let intDate = parseInt(personaCreatedDate)
    let options = {year: 'numeric', month: 'long', day: 'numeric'}
    let formatPersonaCreatedDate = new Date(intDate).toLocaleString('en-US', options)
    console.log("format date", formatPersonaCreatedDate)

    let info = loaded
    ? ( <Card>
        <Grid>
            <Grid.Row className="memberCardRow">
                <Grid.Column floated='left' width={4}>
                    <span className="badgeposition"><Image size='tiny' src={require('../../../images/IconArrowLeft')} avatar />{personaId}</span>
                </Grid.Column>
                <Grid.Column floated='right' width={5}>
                    <span className="avatarposition"><AvatarImage /></span>
                </Grid.Column>
            </Grid.Row>
        </Grid>  
       
                <Card.Content 
                    header={personaAccount} 
                    as={Link} 
                    to={{ 
                        pathname: "/persona-" + personaAccount,
                        hash: personaId
                    }} 
                    className="memberAccount"
                /> 
                <Card.Content>
               
                <Card.Description>
                    <Button>Send $1</Button>
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <span className='date'>Created: {formatPersonaCreatedDate}</span>
            </Card.Content>
        </Card>
    )
    : (
        <Card>
        <Card.Content>
        <Card.Header>
        </Card.Header>
        <Dimmer active>
            <Loader>Loading</Loader>
        </Dimmer>
        </Card.Content>
        <Card.Content extra>
            <Icon name='user' />
            22 friends
        </Card.Content>
        </Card>
        
    )
    console.log('info', info)
   
    return (
        <>
        <Card.Group>
            {info}
        </Card.Group>
        </>
    )
}

