import React, { useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { get, set, del } from '../../utils/storage'
import { appStore, onAppMount } from '../../state/app'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { initDao } from '../../state/near'
import Aaron from '../../img/aaron.png'
import Emmitt from '../../img/emmitt.jpg'

// Material UI components
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import clsx from 'clsx';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonIcon from '@material-ui/icons/Person';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import HowToVoteIcon from '@material-ui/icons/HowToVote'
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50
  },
  warning: {
    float: 'left',
    paddingRight: '10px',
    paddingBottom: '10px'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  customCard: {
    maxWidth: 300,
    minWidth: 275,
    margin: 'auto',
    padding: 20
  },
  rootForm: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
    float: 'left'
  },
  progress: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  }));

const imageName = require('../../img/default-profile.png') // default no-image avatar

export default function Initialize(props) {
    const[done, setDone] = useState(props.done)
    const [periodDuration, setPeriodDuration] = useState('')
    const [votingPeriodLength, setVotingPeriodLength] = useState('')
    const [gracePeriodLength, setGracePeriodLength] = useState('')
    const [proposalDeposit, setProposalDeposit] = useState('')
    const [dilutionBound, setDilutionBound] = useState('')
    const [voteThreshold, setVoteThreshold] = useState('')
    const [summonerContribution, setSummonerContribution] = useState('')
    const [shares, setShares] = useState('')
    const [platformPercent, setPlatformPercent] = useState('')

    const [confirm, setConfirm] = useState(false)
    const [clicked, setClicked] = useState(false)
    const [summoner, setSummoner] = useState()

    const [logo, setLogo] = useState(imageName)
    const [finished, setFinished] = useState(false)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore);

    const {
      accountId,
      currentDaosList,
      near
    } = state

    const {
      contractId
    } = useParams()

    const { register, handleSubmit, watch, errors, control, reset, setValue, getValues } = useForm({
      defaultValues: {
            periodDuration: periodDuration,
            votingPeriodLength: votingPeriodLength,
            gracePeriodLength: gracePeriodLength,
            proposalDeposit: proposalDeposit,
            dilutionBound: dilutionBound,
            voteThreshold: voteThreshold,
            shareAllocation: shares,
            summonerContribution: summonerContribution,
            platformPercent: platformPercent
        }
    })

   
    useEffect(
      () => {
        // remove temporary key
    //    del('near-api-js:keystore:'+contractId+':'+near.connection.networkId)
        
        let i = 0
        while(i < currentDaosList.length){
          if(currentDaosList[i].contractId == contractId){
            let owner = currentDaosList[i].summoner
            setSummoner(owner)
            break
          }
          i++
        }
         
      }, [])

      const handlePeriodDurationChange = (event) => {
        setPeriodDuration(event.target.value)
      }
  
      const handleVotingPeriodLengthChange = (event) => {
          setVotingPeriodLength(event.target.value)
      }
  
      const handleGracePeriodLengthChange = (event) => {
          setGracePeriodLength(event.target.value)
      }
  
      const handleDilutionBoundChange = (event) => {
          setDilutionBound(event.target.value)
      }
  
      const handleProposalDepositChange = (event) => {
          setProposalDeposit(event.target.value)
      }

      const handlePlatformPercentChange = (event) => {
        setPlatformPercent(event.target.value)
      }

      const handleVoteThresholdChange = (event) => {
        setVoteThreshold(event.target.value)
      }

      const handleSummonerContributionChange = (event) => {
        setSummonerContribution(event.target.value)
      }

      const handleSharesChange = (event) => {
        setShares(event.target.value)
      }
  
      const handleConfirmChange = (event) => {
        setConfirm(event.target.checked);
      }

      function formatTime(seconds) {
        let minutes = (seconds / 60).toFixed(0)
        let hours = (seconds / 3600).toFixed(0)
        let days = (seconds / 86400).toFixed(0)
        let weeks = (seconds / 604800).toFixed(0)
        let blocks = (seconds * state.avgBlockTime).toFixed(0)

        let secondString = seconds > 0 ? seconds + ' sec | ' : ''
        let minuteString = minutes > 0 ? minutes + ' min | ' : ''
        let hourString = hours > 0 ? hours + ' hr | ' : ''
        let dayString = days > 0 ? days + 'd | ' : ''
        let weekString = weeks > 0 ? weeks + ' wk | ' : ''
        let blockString = blocks > 0 ? blocks + ' blocks' : ''

        return {
          seconds: secondString,
          minutes: minuteString,
          hours: hourString,
          days: dayString,
          weeks: weekString,
          blocks: blockString
        }
      }

      const onSubmit = async (values) => {
        try{
        
          await initDao(
            state.wallet, 
            contractId,
            periodDuration, 
            votingPeriodLength, 
            gracePeriodLength, 
            proposalDeposit, 
            dilutionBound,
            voteThreshold,
            shares,
            summonerContribution,
            platformPercent
            )
          setFinished(true)
        } catch (err) {
          console.log('error initializing dao', err)

          setFinished(true)
        }
        setFinished(false)
      }
    
      let periodDurationTime = formatTime(periodDuration)
      let votingPeriodLengthTime = formatTime(periodDuration * votingPeriodLength)
      let gracePeriodLengthTime = formatTime(periodDuration * gracePeriodLength)

      return (
        <>
        {summoner == accountId ? (
        <Grid container className={classes.confirmation} spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
          <Typography variant="h3">Choose & Customize Your Community Structure</Typography>
          <br></br>
          <Typography variant="subtitle1">Don't worry, you can change this later.</Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={2} lg={2} xl={2} align="center"></Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} align="center">
          <Card>
            <CardContent>
              <Typography variant="h6">Getting Started</Typography>  
              <Typography variant="body1">Choose one of the example community structures
              below and then customize settings as desired.</Typography><br></br>
              <Typography variant="body1">Catalyst enables your community's governance to evolve to meet its
              governance needs. Everything can be changed so don't worry about making a mistake now.</Typography><br></br>
              <Typography variant="body1">When done customizing, click Initialize Community.</Typography>
              </CardContent>
          </Card>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Corporate Structure</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText>Power vested in one person (CEO)</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PeopleOutlineIcon /></ListItemIcon>
                    <ListItemText>CEO can delegate voting power to a Board of Directors</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HowToVoteIcon /></ListItemIcon>
                    <ListItemText>Simple majority vote (51% of total voting power)</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><RecentActorsIcon /></ListItemIcon>
                    <ListItemText>Anyone can apply to be a member</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
                    <ListItemText>Great for: traditional business, council controlled communities</ListItemText>
                  </ListItem>
                </List>
              </Typography>
              <Button variant="outlined" onClick={() => {
                setPeriodDuration('60')
                setVotingPeriodLength('2880')
                setGracePeriodLength('1440')
                setProposalDeposit('0.1')
                setDilutionBound('3')
                setVoteThreshold('51')
                setShares('5000')
                setPlatformPercent('0.5')
              }}>Choose Corporate Settings</Button>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Democratic Structure</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText>One person, one vote</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PeopleOutlineIcon /></ListItemIcon>
                    <ListItemText>Votes can be delegated</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HowToVoteIcon /></ListItemIcon>
                    <ListItemText>Majority vote (51% of total voting power)</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><RecentActorsIcon /></ListItemIcon>
                    <ListItemText>Anyone can join</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
                    <ListItemText>Great for: government, collectives, and cooperatives</ListItemText>
                  </ListItem>
                </List>
              </Typography>
              <Button variant="outlined" onClick={() => {
                setPeriodDuration('60')
                setVotingPeriodLength('2880')
                setGracePeriodLength('1440')
                setProposalDeposit('0.1')
                setDilutionBound('3')
                setVoteThreshold('51')
                setShares('1')
                setPlatformPercent('0.5')
              }}>Choose Democratic Settings</Button>
            </AccordionDetails>
          </Accordion>
          <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>Representative Structure</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <List>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText>One person, one vote</ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon><PeopleOutlineIcon /></ListItemIcon>
                  <ListItemText>Hold elections and delegate votes to representatives (or a continuous election process)</ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon><HowToVoteIcon /></ListItemIcon>
                  <ListItemText>Majority vote (51% of total voting power)</ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon><RecentActorsIcon /></ListItemIcon>
                  <ListItemText>Anyone can join</ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
                  <ListItemText>Great for: clubs, government, collectives, and cooperatives</ListItemText>
                </ListItem>
              </List>
            </Typography>
            <Button variant="outlined" onClick={() => {
              setPeriodDuration('60')
              setVotingPeriodLength('2880')
              setGracePeriodLength('1440')
              setProposalDeposit('0.1')
              setDilutionBound('3')
              setVoteThreshold('51')
              setShares('1')
              setPlatformPercent('0.5')
            }}>Choose Representative Settings</Button>
          </AccordionDetails>
        </Accordion>
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Autocratic Structure</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <List>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText>One person holds absolute power</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><PeopleOutlineIcon /></ListItemIcon>
                <ListItemText>Votes are not delegated</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><HowToVoteIcon /></ListItemIcon>
                <ListItemText>Leader controls all the voting power</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RecentActorsIcon /></ListItemIcon>
                <ListItemText>Anyone can join but no one but leader makes any decisions</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
                <ListItemText>Great for: dictatorships, sole-propietorships</ListItemText>
              </ListItem>
            </List>
          </Typography>
          <Button variant="outlined" onClick={() => {
            setPeriodDuration('60')
            setVotingPeriodLength('2880')
            setGracePeriodLength('1440')
            setProposalDeposit('0.1')
            setDilutionBound('3')
            setVoteThreshold('51')
            setShares('1000000')
            setPlatformPercent('0.5')
          }}>Choose Autocratic Settings</Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.heading}>Plutocratic Structure</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <List>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText>One NEAR, one vote (power is bought)</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><PeopleOutlineIcon /></ListItemIcon>
                <ListItemText>Votes can be delegated and bought</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><HowToVoteIcon /></ListItemIcon>
                <ListItemText>Majority vote (51% of voting power)</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><RecentActorsIcon /></ListItemIcon>
                <ListItemText>Anyone can contribute in return for voting power</ListItemText>
              </ListItem>
              <ListItem>
                <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
                <ListItemText>Great for: fundraising, crowdsourcing, memberships</ListItemText>
              </ListItem>
            </List>
          </Typography>
          <Button variant="outlined" onClick={() => {
            setPeriodDuration('60')
            setVotingPeriodLength('2880')
            setGracePeriodLength('1440')
            setProposalDeposit('0.1')
            setDilutionBound('3')
            setVoteThreshold('51')
            setShares('1')
            setPlatformPercent('0.5')
          }}>Choose Autocratic Settings</Button>
        </AccordionDetails>
      </Accordion>
        
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} style={{textAlign: 'center'}}>
        <Card>
            <CardContent>
                <Typography variant="h6">Customize Community Settings</Typography>
                <Typography variant="overline">~ {periodDurationTime != '' ? 
                periodDurationTime.seconds + periodDurationTime.minutes + periodDurationTime.hours + periodDurationTime.weeks + periodDurationTime.days + periodDurationTime.blocks
                : ''}
                </Typography>
                <TextField
                fullWidth
                margin="dense"
                id="period-duration"
                variant="outlined"
                name="periodDuration"
                label="Period Duration"
                required={true}
                value={periodDuration}
                onChange={handlePeriodDurationChange}
                inputRef={register({
                    required: true
                })}
                placeholder="14400"
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Seconds</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Decide how long you want each period to be. 
                  E.g. 60=1 min, 3,600=1 hr, 86,400=1 day, 604,800=1 week.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
              <Typography variant="overline">~ {votingPeriodLengthTime != '' ? 
              votingPeriodLengthTime.seconds + votingPeriodLengthTime.minutes + votingPeriodLengthTime.hours + votingPeriodLengthTime.weeks + votingPeriodLengthTime.days + votingPeriodLengthTime.blocks
              : ''}
              </Typography>
              <TextField
                fullWidth
                margin="dense"
                id="voting-period-length"
                variant="outlined"
                required={true}
                name="votingPeriodLength"
                label="Voting Period Length"
                placeholder="42"
                value={votingPeriodLength}
                onChange={handleVotingPeriodLengthChange}
                inputRef={register({
                    required: true,
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Periods</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="How long voting will last.
                  E.g. if each period is 1 min, entering 5 here will set voting period to 5 min (1 x 5).">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />
              <Typography variant="overline">~ {gracePeriodLengthTime != '' ? 
              gracePeriodLengthTime.seconds + gracePeriodLengthTime.minutes + gracePeriodLengthTime.hours + gracePeriodLengthTime.weeks + gracePeriodLengthTime.days + gracePeriodLengthTime.blocks
              : ''}
              </Typography>
              <TextField
                fullWidth
                margin="dense"
                id="grace-period-length"
                variant="outlined"
                required={true}
                name="gracePeriodLength"
                label="Grace Period Length"
                placeholder="42"
                value={gracePeriodLength}
                onChange={handleGracePeriodLengthChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Periods</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="How long the grace period will last.  
                  E.g. if each period is 1 min, entering 5 here will set grace period to 5 min (1 x 5).">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                margin="dense"
                id="proposal-deposit"
                variant="outlined"
                required={true}
                name="proposalDeposit"
                label="Proposal Deposit"
                placeholder="10"
                value={proposalDeposit}
                onChange={handleProposalDepositChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="Amount of NEAR that needs to be deposited to submit a proposal.  
                  Recommend a large enough number to help prevent spam submissions. E.g. 10 NEAR.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
                style={{marginBottom: '10px'}}
              />

              <TextField
                fullWidth
                margin="dense"
                id="dilution-bound"
                variant="outlined"
                required={true}
                name="dilutionBound"
                label="Dilution Bound"
                placeholder="3"
                value={dilutionBound}
                onChange={handleDilutionBoundChange}
                inputRef={register({
                    required: true, 
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="protects members from excessive dilution in case where a large 
                  number of people ragequit.">
                      <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />

              <TextField
              fullWidth
              margin="dense"
              id="vote-threshold"
              variant="outlined"
              required={true}
              name="voteThreshold"
              label="Vote Threshold"
              placeholder="51%"
              value={voteThreshold}
              onChange={handleVoteThresholdChange}
              inputRef={register({
                  required: true, 
              })}
              InputProps={{
                endAdornment: <><InputAdornment position="end">%</InputAdornment>
                <Tooltip TransitionComponent={Zoom} title="minimum % of total votes that must be cast in order for a proposal to pass.">
                    <InfoIcon fontSize="small" style={{marginLeft:'5px', marginTop:'-3px'}} />
                </Tooltip>
                </>
              }}
              />

              <TextField
                fullWidth
                margin="dense"
                id="summoner-shares"
                required={true}
                variant="outlined"
                name="shareAllocation"
                label="Initial Share Allocation"
                placeholder="e.g. 100000"
                value={shares}
                onChange={handleSharesChange}
                inputRef={register({
                    required: true,
                    validate: value => value != '' || <p style={{color:'red'}}>You must specify the number of shares that will be allocated to the summoner.</p>
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">shares</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The number of voting shares the community creator is allocating to themselves.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
                 
              <TextField
                fullWidth
                margin="dense"
                id="summoner-contribution"
                required={true}
                variant="outlined"
                name="summonerContribution"
                label="Initial Contribution"
                placeholder="e.g. 100000"
                value={summonerContribution}
                onChange={handleSummonerContributionChange}
                inputRef={register({
                    required: true,
                    validate: value => value != '' || <p style={{color:'red'}}>You must specify the amount that will be contributed to the community on initialization.</p>
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">Ⓝ</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The amount of Ⓝ you want to seed the community fund with. Can be 0.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
              <Card>
              <CardContent>
                <Grid container alignItems="center" justifyContent="flex-end" spacing={0}>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="center">
                    <Avatar src={Aaron} className={classes.large}  /><br></br>
                    <Typography variant="caption" color="textSecondary">Aaron</Typography>
                  </Grid>
                  <Grid item xs={8} sm={8} md={8} lg={8} xl={8} align="center" style={{padding: '5px', lineHeight:'1em'}}>
                    <Typography variant="caption" color="textSecondary">
                    We want to make Catalyst better.<br></br>You can help by designating a small percentage of each successful payout to supporting future development.<br></br>
                    Thank you.
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2} align="center">
                      <Avatar src={Emmitt} className={classes.large}  /><br></br>
                      <Typography variant="caption" color="textSecondary">Emmitt</Typography>
                  </Grid>
                </Grid>
              </CardContent>
              </Card>
              <TextField
                fullWidth
                margin="dense"
                id="platform-percent"
                required={true}
                variant="outlined"
                name="platformPercent"
                label="Catalyst Support"
                placeholder="e.g. 0.5"
                value={platformPercent}
                onChange={handlePlatformPercentChange}
                inputRef={register({
                    required: true,
                    validate: value => value != '' || <p style={{color:'red'}}>You must specify a percent amount of each successful payout proposal that will go to support continued Catalyst development (even if 0)</p>
                })}
                InputProps={{
                  endAdornment: <><InputAdornment position="end">%</InputAdornment>
                  <Tooltip TransitionComponent={Zoom} title="The percentage amount you are willing to send to the Catalyst development team that comes off each successful proposal payout.">
                      <InfoIcon fontSize="small" style={{marginRight:'5px', marginTop:'-3px'}} />
                  </Tooltip>
                  </>
                }}
              />
             
              </CardContent>
              </Card>
              <br></br>
              <Button
              disabled={state.app.accountTaken || clicked}
              variant="contained"
              color="primary"
              onClick={handleSubmit(onSubmit)}>
                INITIALIZE COMMUNITY
              </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={2} lg={2} xl={2} align="center"></Grid>
      </Grid>
        ) : 'Community not initialized yet'}
        </>
    )
  
}