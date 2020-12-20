import React, { useState, useEffect } from 'react';
import { Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { retrieveRecord } from '../../../utils/threadsDB'

import styled from 'styled-components'

const Container = styled.div`
    position: relative;
    margin-top: 10px;
    margin-left: 100px;
    float:left;
`
const AvatarImage = styled.img`
        vertical-align: middle;
        width: 50px;
        height: 50px;
        border-radius: 50%;
`

export default function Avatar(props) {

    const [avatar, setAvatar] = useState('')
    const [exists, setExists] = useState(false)

    const {
        personaId,
        accountId
    } = props

    useEffect(
        () => {
            async function loadAvatar() {
                try{
                    console.log('avatar personaId', personaId)
                    record = await retrieveRecord(personaId, 'Persona')
                    
                    console.log('persona record', record)
                    if(record !== undefined) {
                        setExists(true)
                        setAvatar(record)
                        return record
                    } else {
                        console.log('no persona record')
                    }
                } catch (err) {
                    console.log('no avatar')
                    return false
                }
            }
            
            loadAvatar()
                .then((res) => {
                    console.log('persona avatar exists', res)
                })
        },
        []
    )

    return(       
   //         exists ? <Image src={avatar} avatar as={Link} to={{ pathname: '/member-' + accountId, hash: personaId }} /> 
   //         : <Image src={require('../../../images/default-profile.png')} avatar as={Link} to={{ pathname: '/member-' + accountId, hash: profileId }}/>
            exists ? <Container><AvatarImage src={avatar} /> </Container>
            : <Container><AvatarImage src={require('../../../images/default-profile.png')} /></Container>
        )
}