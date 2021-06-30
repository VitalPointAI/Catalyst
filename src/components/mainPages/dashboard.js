import React, { useEffect, useState, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import * as d3 from 'd3'
import "d3-time-format"
import Persona from '@aluhning/get-personas-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { dao } from '../../utils/dao'

// Material UI
import { makeStyles } from '@material-ui/core/styles'
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
    selectEmpty: {
    marginTop: theme.spacing(2),
    },
  }))

const parseTime = d3.timeParse("%B %d, %Y")
const formatTime = d3.timeFormat("%B %d, %Y")

const data = new Persona()

export default function Dashboard(props) {
    const [memberData, setMemberData] = useState()
    const [proposalData, setProposalData] = useState()
    const [finalPropDataFrame, setFinalPropDataFrame] = useState()
    const [contractId, setContractId] = useState('')
    const [memberCommunities, setMemberCommunities] = useState()
    const [isUpdated, setIsUpdated] = useState(false)
    const [first, setFirst] = useState(true)

    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    let communities = []
    let newMemberDataFrame = []
    let proposalDataFrame = []
    let activityDataFrame = []

    const {
      accountId,
      currentDaosList,
      near,
      wallet
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
                let propData
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
                    propData ? setProposalData(propData) : false
                } else {
                    memData = await data.getMemberStats(contractId)
                    console.log('memdata', memData)
                    memData ? setMemberData(memData) : false
                    propData = await data.getProposalStats(contractId)
                    console.log('propdata', propData)
                    propData ? setProposalData(propData) : false
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
                                    timeStamp: formatDate(propData.data[k].data.processTime), 
                                    number: 1
                                })
                            }
                        k++
                        }
                        
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
                        }
                        if(account){
                            console.log('account', account)
                            let formatted = formatNearAmount(account.amount, 0)
                            balance = balance + parseInt(formatted)
                            console.log('balance', balance)
                        }
                            
                        let getNearPrice = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd')
                        console.log('near price', getNearPrice)
                        let value = (getNearPrice.data.near.usd * balance).toFixed(2)

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
                  
            }
            
         fetchData()
            .then(res => {
                d3.selectAll("#d3-members > *").remove()
                createMemberGraph()
            })
      
    }, [contractId, isUpdated]
    )

    const handleContractIdChange = (event) => {
        const value = event.target.value
        setFinalPropDataFrame([])
        setContractId(value)
        handleUpdate()
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
        const y = d3.scaleOrdinal().range([height, 0]);
        
      
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
       // y.domain([0, d3.max(data, (d) => { return d.number; })]);
       y.domain(data.map((d) => {return d.number}))
      
       
       svg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("d", valueLine)

        svg.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d-%y"))).selectAll("text")
            
        
        svg.append("g")
          .call(d3.axisLeft(y));
    }

    const createActivityGraph = async () => {
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
          const y = d3.scaleOrdinal().range([height, 0]);
          
        
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
         // y.domain([0, d3.max(data, (d) => { return d.number; })]);
         y.domain(data.map((d) => {return d.number}))
        
         
         svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueLine)
  
          svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d-%y"))).selectAll("text")
              
          
          svg.append("g")
            .call(d3.axisLeft(y));
        }

    return (
        <>
        <div>
        <Grid container alignItems="center" justify="center" spacing={1} style={{padding: '20px'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" style={{marginBottom:'30px'}}>
                <Typography variant='h3'>Your Communities Dashboard</Typography>
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
                    <TableRow key={communityName}>
                        <TableCell component="th" scope="row">{communityName}</TableCell>
                        <TableCell align="right">{totalMembers}</TableCell>
                        <TableCell align="right">{communityFund}</TableCell>
                        <TableCell align="right">{communityValue}</TableCell>
                        <TableCell align="right">{totalProposals}</TableCell>
                        <TableCell align="right">{passedProposals}</TableCell>
                        <TableCell align="right">{failedProposals}</TableCell>
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
                    <CardHeader 
                        title="Member Growth"
                        subheader="Number of personas joining the community over time."
                    />
                    <div id="d3-members"></div>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                <Card className={classes.card}>
                    <CardHeader 
                        title="Daily Activity"
                        subheader="An indication of how active the community is."
                    />
                    <div id="d3-members"></div>
                </Card>
            </Grid>
        </Grid>
        </div>
        </>
    )
}