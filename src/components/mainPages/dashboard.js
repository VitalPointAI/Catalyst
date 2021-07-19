import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../state/app'
import * as d3 from 'd3'
import "d3-time-format"
import Persona from '@aluhning/get-personas-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import OpportunityCard from '../OpportunityCard/OpportunityCard'
import { dao } from '../../utils/dao'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Avatar from '@material-ui/core/Avatar'
import AppBar from '@material-ui/core/AppBar'
import Tab from '@material-ui/core/Tab'
import TabContext from '@material-ui/lab/TabContext'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'

import './dashboard.css'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    card: {
        minHeight: '350px'
    },
    line: {
        stroke: 'steelblue'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        float: 'left',
        marginRight: '3px'
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    selectEmpty: {
    marginTop: theme.spacing(2),
    },
  }))

const parseTime = d3.timeParse("%B %d, %Y")
const formatTime = d3.timeFormat("%B %d, %Y")

const data = new Persona()

const defaultLogo = require('../../img/default_logo.png')

export default function Dashboard(props) {
    const [memberData, setMemberData] = useState()
    const [proposalData, setProposalData] = useState()
    const [finalPropDataFrame, setFinalPropDataFrame] = useState()
    const [contractId, setContractId] = useState('')
    const [memberCommunities, setMemberCommunities] = useState()
    const [isUpdated, setIsUpdated] = useState(false)
    const [first, setFirst] = useState(true)
    const [logo, setLogo] = useState(defaultLogo)
    const [value, setValue] = useState('1')
    const [recommendations, setRecommendations] = useState([])
    const [suitabilityScore, setSuitabilityScore] = useState()
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const matches = useMediaQuery('(max-width:500px)')

    let communities = []
    let newMemberDataFrame = []
    let proposalDataFrame = []
    let activityDataFrame = []

    const {
      accountId,
      currentDaosList,
      near,
      wallet,
      appIdx,
      didRegistryContract,
    } = state

    console.log('curDaosList', currentDaosList)
    useEffect(
        () => {
            
            if(currentDaosList.length > 0){
                let i = 0
                console.log('here i')
                console.log('length', currentDaosList.length)
                while (i < currentDaosList.length){
                    if(currentDaosList[i].summoner == accountId){
                        console.log('here')
                        let name = currentDaosList[i].contractId.split('.')
                        communities.push({contractId: currentDaosList[i].contractId, communityName: name[0]})
                        console.log('communities', communities)
                        setMemberCommunities(communities)
                    }
                i++
                }
            }
            if(contractId == '' && communities.length > 0){
                let mostRecentContractId = communities[communities.length-1].contractId
                setContractId(mostRecentContractId)
            }

            async function fetchData() {
                let memData
                let propData = []
                let thisContractId
               
                if(contractId == '') {
                    console.log('maybe')
                    let mostRecentContractId = communities.length > 0 ? communities[communities.length-1].contractId 
                    : 'vitalpointai.testnet'
                    setContractId(mostRecentContractId)
                    thisContractId = mostRecentContractId
                    console.log('mostrecent', mostRecentContractId)
                    memData = await data.getMemberStats(mostRecentContractId)
                    console.log('memdata', memData)
                    memData ? setMemberData(memData) : false
                    propData = await data.getProposalStats(mostRecentContractId)
                    console.log('propdata', propData)
                    propData && Object.keys(propData).length > 0 ? setProposalData(propData) : false
                } else {
                    memData = await data.getMemberStats(contractId)
                    console.log('memdata', memData)
                    memData ? setMemberData(memData) : false
                    propData = await data.getProposalStats(contractId)
                    console.log('propdata', propData)
                    propData && Object.keys(propData).length > 0 ? setProposalData(propData) : false
                }

                    // construct new member data frame
                    if(memData && memData.data.length > 0 ){
                        console.log('next')
                        let j = 0
                        while (j < memData.data.length){
                            console.log('datatype', memData.data[j].dataType)
                            if(memData.data[j].dataType =='newSummoner') {
                                console.log('formatteddate', formatDate(memData.data[j].data.summonTime))
                                newMemberDataFrame.push({
                                    type: 'Summon',
                                    joined: formatDate(memData.data[j].data.summonTime), 
                                    number: 1
                                })
                                activityDataFrame.push({
                                    type: 'Summon',
                                    timeStamp: formatDate(memData.data[j].data.summonTime), 
                                    number: 1
                                })
                            }
                            if(memData.data[j].dataType == 'newMember'){
                                newMemberDataFrame.push({
                                    type: 'New Member',
                                    joined: formatDate(memData.data[j].data.joined), 
                                    number: 1
                                })
                                activityDataFrame.push({
                                    type: 'New Member',
                                    timeStamp: formatDate(memData.data[j].data.joined), 
                                    number: 1
                                })
                            }
                            if(memData.data[j].dataType == 'changeMember'){
                                activityDataFrame.push({
                                    type: 'Update Member',
                                    timeStamp: formatDate(memData.data[j].data.changeTime), 
                                    number: 1
                                })
                            }
                        j++
                        }
                    }
                    console.log('newmemberdataframe', newMemberDataFrame)

                    // For each byte in our array, retrieve the char code value of the binary value
                    const binArrayToString = array => array.map(byte => String.fromCharCode(parseInt(byte, 2))).join('')

                    // construct proposals data frame
                    if(propData && propData.data.length > 0){
                        let k = 0
                        let totalProposals = propData.data.length
                        let communityName = contractId.split('.')[0]
                        let passed = 0
                        let notPassed = 0
                        let inProgress = 0
                        while(k < propData.data.length) {
                            //count number of passed proposals
                            if(propData.data[k].data.proposalType[1]==true && propData.data[k].data.proposalType[2]==true){
                                passed++
                                activityDataFrame.push({
                                    type: 'Proposal Passed',
                                    timeStamp: formatDate(propData.data[k].data.processTime), 
                                    number: 1
                                })
                            }
                            //count number of failed proposals
                            if(propData.data[k].data.proposalType[1]==true && propData.data[k].data.proposalType[2]==false){
                                notPassed++
                                activityDataFrame.push({
                                    type: 'Proposal Failed',
                                    timeStamp: formatDate(propData.data[k].data.processTime), 
                                    number: 1
                                })
                            }
                            //count number of proposals in process (sponsored but not processed, thus in voting period)
                            if(propData.data[k].data.proposalType[0]==true && propData.data[k].data.proposalType[1]==false){
                                inProgress++
                                activityDataFrame.push({
                                    type: 'Proposal Sponsored',
                                    timeStamp: formatDate(propData.data[k].data.sponsorTime), 
                                    number: 1
                                })
                            }
                        k++
                        }
                        console.log('activitydataframe', activityDataFrame)
                        let account
                        let balance = 0
                        if(contractId != ''){
                            try {
                                account = await near.connection.provider.query({
                                    request_type: "view_account",
                                    finality: "final",
                                    account_id: contractId,
                                })
                            } catch (err) {
                                console.log('problem retrieving account', err)
                            }
                            try {
                                balance = await near.connection.provider.query({
                                    request_type: "call_function",
                                    finality: "final",
                                    account_id: contractId,
                                    method_name: "getGuildTokenBalances",
                                    args_base64: "",
                                })
                                balance = balance.result.map(c => String.fromCharCode(c)).join('')
                                let converted = balance.split(':')[2]
                                balance = converted.replace(/[^a-zA-Z0-9 ]/g, "")
                                
                            } catch (err) {
                                console.log('problem retrieving community balance', err)
                            }
                        }
                        if(account){
                            console.log('account', account)
                            let formatted = formatNearAmount(balance, 0)
                            balance = parseInt(formatted)
                            console.log('balance', balance)
                        }
                            
                        let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                        console.log('near price', getNearPrice)
                        let value = (getNearPrice.data.near.usd * balance).toFixed(2)

                        let result = await data.getDao(contractId)
                        console.log('result', result)
                        if(result){
                            result.logo ? setLogo(result.logo) : setLogo(defaultLogo)
                        }

                        const daoContract = await dao.initDaoContract(wallet.account(), contractId)

                        let totalMembers
                        try {
                            totalMembers = await daoContract.getTotalMembers()
                            console.log('total Members', totalMembers)
                        } catch (err) {
                            console.log('no members', err)
                        }

                        proposalDataFrame.push({
                            communityName: communityName,
                            totalMembers: parseInt(totalMembers),
                            communityFund: balance, 
                            communityValue: value, 
                            totalProposals: totalProposals, 
                            passedProposals: passed, 
                            failedProposals: notPassed, 
                            inProgressProposals: inProgress
                        })

                        setFinalPropDataFrame(proposalDataFrame)

                        console.log('proposaldataframe', proposalDataFrame)

                    }

                    // Persona Opportunity Recommendations

                    // 1. Build complete list of all opportuntities for all DAOs
                    let allOpportunities = []
                    if(currentDaosList && currentDaosList.length > 0){
                        let i = 0
                        while (i < currentDaosList.length){
                            let thisCurDaoIdx
                            let daoAccount
                            try{
                              daoAccount = new nearAPI.Account(near.connection, currentDaosList[i].contractId)
                            } catch (err) {
                              console.log('no account', err)
                            }
                            thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                        
                            let singleDaoOpportunity = await thisCurDaoIdx.get('opportunities', thisCurDaoIdx.id)
                        //let singleDaoOpportunity = await data.getOpportunities(currentDaosList[i].contractId)
                        console.log('singleDaoopportunity', singleDaoOpportunity)
                        if(singleDaoOpportunity && Object.keys(singleDaoOpportunity).length > 0){
                            allOpportunities.push(singleDaoOpportunity.opportunities[0])
                        }
                        i++
                        }
                    }
                    console.log('all opportunities', allOpportunities)

                    // 2. Retrieve current persona data
                    let currentPersona = await data.getPersona(accountId)
                    console.log('all opp persona', currentPersona)

                    // 3. Initialize recommendations array
                    let currentRecommendations = []
                  
                    // 3. For each opportunity, compare opportunity skillset requirements to persona skillsets and add to recommendations array if the same
                    // calculate a suitability percentage from skills required (true) (total skills possessed / total skills)
                    let j = 0
                    let developerPercentage = 0
                    let developerSkillCount = 0
                    let developerSkillMatch = 0
                    let skillPercentage = 0
                    let skillCount = 0
                    let skillMatch = 0
                  
                    while (j < allOpportunities.length){
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                            if(value){
                                developerSkillCount++
                                for (const [pkey, pvalue] of Object.entries(currentPersona.developerSkillSet)){
                                    if(pkey == key && pvalue == value){
                                        developerSkillMatch ++
                                    }
                                }
                            }
                        }
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                            if(value){
                                skillCount++
                                for (const [pkey, pvalue] of Object.entries(currentPersona.skillSet)){
                                    if(pkey == key && pvalue == value){
                                        skillMatch++
                                    }
                                }
                            }
                        }
                        let asuitabilityScore = ((skillMatch + developerSkillMatch)/(skillCount + developerSkillCount)*100).toFixed(0)
                        setSuitabilityScore(asuitabilityScore)
                        currentRecommendations.push({opportunity: allOpportunities[j], skillMatch: skillMatch, developerSkillMatch: developerSkillMatch, skillCount: skillCount, developerSkillCount: developerSkillCount, suitabilityScore: asuitabilityScore})
                        j++
                    }
                    setRecommendations(currentRecommendations)
                    console.log('recommendations', currentRecommendations)
            }
            
         fetchData()
            .then(res => {
                d3.selectAll("#d3-members > *").remove()
                createMemberGraph()
                d3.selectAll("#d3-activity > *").remove()
                createActivityGraph()
            })
      
    }, [contractId, isUpdated]
    )

    const handleContractIdChange = (event) => {
        const value = event.target.value
        setLogo(defaultLogo)
        setFinalPropDataFrame([])
        setContractId(value)
        handleUpdate()
    }

    const handleTabChange = (event, newValue) => {
        setValue(newValue)
    }

    function handleUpdate() {
        setIsUpdated(!isUpdated)
    }

    function formatDate(timestamp) {
        let stringDate = timestamp.toString()
        let options = {year: 'numeric', month: 'long', day: 'numeric'}
        return new Date(parseInt(stringDate.slice(0,13))).toLocaleString('en-US', options)  
    }

    const createMemberGraph = async () => {
      //  let data = newMemberDataFrame
        let fdata = d3.rollups(newMemberDataFrame, g => g.length, d => d.joined)
       
        console.log('data', fdata)
        let data = []
        fdata.forEach((d) => {
            console.log('d here', d)
            data.push({joined: d[0], number: d[1] + (data.length > 0 ? data[data.length - 1].number : 0)})
        })
        console.log('newData', data)
        // let ydomain = []
        // data.forEach((d) => {
        //    ydomain.push(d[1]) 
        // })

        // console.log('ydomain', ydomain)
        const margin = { top: 40, right: 20, bottom: 50, left: 70 },
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);
        
      
        const valueLine = d3.line()
          .x((d) => { console.log('d value', d.joined); return x(d.joined); })
          .y((d) => { console.log('y value', d.number); return y(d.number); });
      
          console.log('valueline', valueLine)
        const svg = d3.select("#d3-members").append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 960 600")
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
        
      
        data.forEach((d) => {
            console.log('d', d)
          d.joined = parseTime(d.joined);
          console.log('d time', d.joined)
          d.number = +d.number;
        });
      
        data = data.sort((a, b) => +a.joined - +b.joined)
        console.log('data here', data)
      
        x.domain(d3.extent(data, (d) => { return d.joined; }));
        
        y.domain([0, d3.max(data, (d) => { return d.number; })]);
       //y.domain(data.map((d) => {return d.number}))
      
       
       svg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("d", valueLine)

            // Add the scatterplot
        svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.joined); })
        .attr("cy", function(d) { return y(d.number); });

        svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d-%y")).tickValues(data.map((d) => {return d.joined}))).selectAll("text")
            
        
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format('d')).tickValues(data.map((d) => {return d.number})))
    }

    const createActivityGraph = async () => {
        //  let data = newMemberDataFrame
          let fdata = d3.rollups(activityDataFrame, g => g.length, d => d.timeStamp)
         
          console.log('data', fdata)
          let data = []
          fdata.forEach((d) => {
              console.log('d here', d)
              data.push({timeStamp: d[0], number: d[1] + (data.length > 0 ? data[data.length - 1].number : 0)})
          })
          console.log('newData', data)
          // let ydomain = []
          // data.forEach((d) => {
          //    ydomain.push(d[1]) 
          // })
  
          // console.log('ydomain', ydomain)
          const margin = { top: 40, right: 20, bottom: 50, left: 70 },
            width = 960 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;
          const x = d3.scaleTime()
          const y = d3.scaleLinear().range([height, 0]);
          
        
          const valueLine = d3.line()
            .x((d) => { console.log('d value', d.timeStamp); return x(d.timeStamp); })
            .y((d) => { console.log('y value', d.number); return y(d.number); });
        
            console.log('valueline', valueLine)
          const svg = d3.select("#d3-activity").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 960 600")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
          
        
          data.forEach((d) => {
              console.log('d', d)
            d.timeStamp = parseTime(d.timeStamp);
            console.log('d time', d.timeStamp)
            d.number = +d.number;
          });
        
          data = data.sort((a, b) => +a.timeStamp - +b.timeStamp)
          console.log('data here', data)
        
        //   x.domain([d3.timeDay.offset(d3.min(data, function(d) {
        //     return d.timeStamp;
        // }), 0), d3.timeDay.offset(d3.max(data, function(d) {
        //     return d.timeStamp;
        // }), 1)]);
        
          x.domain(d3.extent(data, (d) => { return d.timeStamp })).range([0, width])
        //  y.domain([d3.min(data, (d) => { return d.number}), d3.max(data, (d) => { return d.number; })]);
          y.domain([0, d3.max(data, (d) => { return d.number; })]);
         //   y.domain(data.map((d) => {return d.number}))
        
         
         svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueLine)
            
        // Add the scatterplot
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return x(d.timeStamp); })
            .attr("cy", function(d) { return y(d.number); });

          svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d-%y")).tickValues(data.map((d) => {return d.timeStamp}))).selectAll("text")
              
          
          svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format('d')).tickValues(data.map((d) => {return d.number})))
        }

    return (
        <>
        <div className={classes.root}>
       
        <TabContext value={value}>
            <AppBar position="static">
            <TabList onChange={handleTabChange} aria-label="dashboard tabs" centered>
                <Tab label="Persona Dashboard" value="1" />
                <Tab label="Community Dashboard" value="2" />
            </TabList>
            </AppBar>
            <TabPanel value="1">
            Recommended Opportunities
            {recommendations && recommendations.length > 0 ?
                recommendations.map((fr, i) => {
                
                  return(
                    <OpportunityCard 
                      key={i}
                      creator={fr.opportunity.proposer}
                      created={fr.opportunity.submitDate}
                      updated={fr.opportunity.updatedDate}
                      reward={fr.opportunity.reward}
                      category={fr.opportunity.category}
                      projectName={fr.opportunity.projectName}
                      details={fr.opportunity.details}
                      title={fr.opportunity.title}
                      opportunityId={fr.opportunity.opportunityId}
                      opportunityStatus={fr.opportunity.status}
                      permission={fr.opportunity.permission}
                      skillCount={fr.skillCount}
                      skillMatch={fr.skillMatch}
                      developerSkillCount={fr.developerSkillCount}
                      developerSkillMatch={fr.developerSkillMatch}
                      suitabilityScore={fr.suitabilityScore}
                    />
                  )
                }) : <Card className={classes.card}>
                <Typography variant="h5">No Recommended Opportunities Yet - Please Check Back Soon.</Typography>
              </Card> }
            </TabPanel>
            <TabPanel value="2">
                <div>
                <Grid container alignItems="center" justify="center" spacing={1} style={{padding: '20px'}}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
                    {!matches ? <Typography variant='h3'>Community Dashboard</Typography> : <Typography variant='h4'>Community Dashboard</Typography>}
                        <Typography variant='body1'>Community and participation metrics.</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
                        <FormControl className={classes.formControl}>
                        <InputLabel id="community-select">Community</InputLabel>
                        <Select
                        native
                        value={contractId}
                        onChange={handleContractIdChange}
                        > 
                        {memberCommunities && memberCommunities.length > 0 ?
                            memberCommunities.reverse().map((community, i) => (
                                <option key={community.communityName} value={community.contractId}>{community.communityName}</option>
                            ))
                            : null }
        
                        </Select>
                    </FormControl>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginTop: '20px', marginBottom:'30px'}}>
                    <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                        <TableCell>Community</TableCell>
                        <TableCell align="right">Members</TableCell>
                        <TableCell align="right">Fund Ⓝ</TableCell>
                        <TableCell align="right">Value (USD)</TableCell>
                        <TableCell align="right">Proposals</TableCell>
                        <TableCell align="right">Passed</TableCell>
                        <TableCell align="right">Not Passed</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {finalPropDataFrame && finalPropDataFrame.length > 0 ?
                    
                        finalPropDataFrame.map(({
                            communityName, 
                            totalMembers, 
                            communityFund, 
                            communityValue, 
                            totalProposals, 
                            passedProposals, 
                            failedProposals, 
                            inProgressProposals}) => {
                        
                            return (
                            <TableRow key={communityName ? communityName : null}>
                                <TableCell component="th" scope="row">
                                <Link to={`dao/${contractId}`}>
                                    <Avatar src={logo} variant="square" className={classes.small}/>
                                    <Typography variant="overline">{communityName ? communityName : null}</Typography>
                                </Link>
                                </TableCell>
                                <TableCell align="right">{totalMembers ? totalMembers : '0'}</TableCell>
                                <TableCell align="right">{communityFund ? communityFund : '0'}</TableCell>
                                <TableCell align="right">{communityValue ? communityValue : '0'}</TableCell>
                                <TableCell align="right">{totalProposals ? totalProposals : '0'}</TableCell>
                                <TableCell align="right">{passedProposals ? passedProposals : '0'}</TableCell>
                                <TableCell align="right">{failedProposals ? failedProposals : '0'}</TableCell>
                                </TableRow>
                            )
                        
                            })
                        : (
                        <TableRow>
                        <TableCell component="th" scope="row">
                        <Typography variant="overline">No Results</Typography>
                        </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </TableContainer>
                </Grid>
                </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                        <Card className={classes.card}>
                            <Tooltip TransitionComponent={Zoom} title="The number of unique personas that are members of the community.">
                                <InfoIcon fontSize="small" style={{marginRight:'5px',marginTop:'3px',float:'right'}}/>
                            </Tooltip>
                            <CardHeader 
                                title="Member Growth"
                                subheader="Number of personas joining the community over time."
                            />   
                            <div id="d3-members"></div>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                        <Card className={classes.card}>
                            <Tooltip TransitionComponent={Zoom} title="Sum of all community actions that have taken place each day.  Includes: submit proposal (any kind), sponsor proposal, process proposal, donation.  Does not include voting actions or editing actions.">
                                <InfoIcon fontSize="small" style={{marginRight:'5px',marginTop:'3px',float:'right'}}/>                    
                            </Tooltip>
                            <CardHeader 
                                title="Daily Activity"
                                subheader="An indication of how active the community is."
                            />
                                        
                            <div id="d3-activity"></div>
                        </Card>
                    </Grid>
                </Grid>
                </div>
            </TabPanel>
        </TabContext>
       
        </div>
       
        </>
    )
}