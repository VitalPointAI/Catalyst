import React, { useState, useEffect } from 'react';
import { Container, Header, Card } from 'semantic-ui-react';
import PersonaCard from './PersonaCard/personaCard';
import styled from 'styled-components'

import './members.css';

const PersonaContainer = styled.div`
    position: relative;
    margin-top: 10px;
    margin-left: 100px;
    width:95%;
`

export default function Personas(props) {
    const[loaded, setLoaded] = useState(false)

    const{
        contract,
        personas
    } = props

    useEffect(
        () => {

           
        },
        []
    )
   let Personas
        if (personas && personas.length > 0) {
            personas.personas.map(persona => {
                console.log('personas map', persona)
            Personas = (    
                <PersonaCard
                    key={persona[0]}
                    personaId={persona[0]}
                    personaAccount={persona[1]}
                    personaCreatedDate={persona[2]}
                    personaStatus={persona[3]}
                    personaPrivacy={persona[4]}
                    contract={contract}
                    personas={personas}
                />
            )
        })
        } else {
            Personas = (<><div>You have no personas</div></>)
        }

        return (
            {loaded} ?
                {personas} ? (
                    <PersonaContainer>
                        {Personas}
                    </PersonaContainer>
                ) : (
                    <PersonaContainer>
                        <div>Loading</div>
                    </PersonaContainer>
                )
                : <PersonaContainer>
                    <div>Loading</div>
                </PersonaContainer>
        )
}