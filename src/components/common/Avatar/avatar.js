import React, { useState, useEffect } from 'react';

import styled from 'styled-components'

const Container = styled.div`
    position: relative;
`
const AvatarImage = styled.img`
        vertical-align: middle;
        min-width: 36px;
        width: auto;
        height: 36px;
        border-radius: 50%;
`

export default function Avatar(props) {

    const [avatar, setAvatar] = useState()
    const [exists, setExists] = useState(false)

    const {
        curUserIdx,
        accountId
    } = props

    useEffect(
        () => {
            async function loadAvatar() {
                
                if(curUserIdx) {
                let result = await curUserIdx.get('profile', curUserIdx.id)
               
                    if(result) {
                        result.avatar ? setAvatar(result.avatar) : setAvatar ('')
                    }
                }
            }
            
            loadAvatar()
                .then((res) => {
                  
                })
        },
        [curUserIdx, avatar]
    )

    return(       
        <div>
         <AvatarImage src={avatar} /> 
        </div>
        )
}