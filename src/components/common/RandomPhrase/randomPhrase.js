import React from 'react'

// Material UI components
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
  accountButton: {
    margin: theme.spacing(0),
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function RandomPhrase(props) {

    const classes = useStyles()
    
    const randomPhrases = [
        'Catalyst is build on NEAR Protocol and Ceramic IDX',
        'We like to think that we are catalyzing the future of communities with Catalyst',
        'It will not be much longer now, we promise.',
        'We are retrieving all kinds of data goodness from the decentralized, open web.',
    ]

    function getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }

    let randomChoice = getRandomInt(randomPhrases.length)
    console.log('random choice', randomChoice)

    return (
        <>
            <Typography variant="h6">{randomPhrases[randomChoice]}</Typography>
      </>
    )
}