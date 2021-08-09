import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { appStore, onAppMount } from '../../state/app'
import * as d3 from 'd3'
import "d3-time-format"
import Persona from '@aluhning/get-personas-js'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import OpportunityCard from '../OpportunityCard/OpportunityCard'
import { dao } from '../../utils/dao'
import * as nearAPI from 'near-api-js'
import { ceramic } from '../../utils/ceramic'
import MemberProfile from '../MemberProfileDisplay/memberProfile'
import OpportunityProposalDetails from '../ProposalDetails/opportunityProposalDetails'

// Material UI
import { lighten, makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import DeleteIcon from '@material-ui/icons/Delete'
import FilterListIcon from '@material-ui/icons/FilterList'
import Tooltip from '@material-ui/core/Tooltip'
import Zoom from '@material-ui/core/Zoom'
import InfoIcon from '@material-ui/icons/Info'
import Avatar from '@material-ui/core/Avatar'
import AppBar from '@material-ui/core/AppBar'
import Tab from '@material-ui/core/Tab'
import TabContext from '@material-ui/lab/TabContext'
import TabList from '@material-ui/lab/TabList'
import TabPanel from '@material-ui/lab/TabPanel'
import { CircularProgress } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'
import Button from '@material-ui/core/Button'

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
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
        padding: '5px'
    },
    table: {
        
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
  }))

const useToolbarStyles = makeStyles((theme) => ({
root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
},
highlight:
    theme.palette.type === 'light'
    ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
    : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
        },
title: {
    flex: '1 1 100%',
},
}));

const parseTime = d3.timeParse("%B %d, %Y")
const formatTime = d3.timeFormat("%B %d, %Y")

const data = new Persona()

const defaultLogo = require('../../img/default_logo.png')

const CARDS_TO_SHOW = 1

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
    const [recommendationsLoaded, setRecommendationsLoaded] = useState(false)
    const [opportunityProposalDetailsClicked, setOpportunityProposalDetailsClicked] = useState(false)
    const [opportunityId, setOpportunityId] = useState()
    const [proposer, setProposer] = useState()
    const [rowContractId, setRowContractId] = useState()
    const [curDaoIdx, setCurDaoIdx] = useState()

    const [order, setOrder] = useState('desc')
    const [orderBy, setOrderBy] = useState('suitability')
    const [selected, setSelected] = useState([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    const [anchorEl, setAnchorEl] = useState(null)

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
                        console.log('prop data here', propData)
                        let k = 0
                        let totalProposals = propData.data.length
                        let communityName = contractId.split('.')[0]
                        let passed = 0
                        let notPassed = 0
                        let inProgress = 0
                        while(k < propData.data.length) {
                            //count number of passed proposals
                            if(propData.data[k].data.proposalType && propData.data[k].data.proposalType[1]==true && propData.data[k].data.proposalType[2]==true){
                                passed++
                                activityDataFrame.push({
                                    type: 'Proposal Passed',
                                    timeStamp: formatDate(propData.data[k].data.processTime), 
                                    number: 1
                                })
                            }
                            //count number of failed proposals
                            if(propData.data[k].data.proposalType && propData.data[k].data.proposalType[1]==true && propData.data[k].data.proposalType[2]==false){
                                notPassed++
                                activityDataFrame.push({
                                    type: 'Proposal Failed',
                                    timeStamp: formatDate(propData.data[k].data.processTime), 
                                    number: 1
                                })
                            }
                            //count number of proposals in process (sponsored but not processed, thus in voting period)
                            if(propData.data[k].data.proposalType && propData.data[k].data.proposalType[0]==true && propData.data[k].data.proposalType[1]==false){
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
                            let singleDaoOpportunity
                            try{
                              daoAccount = new nearAPI.Account(near.connection, currentDaosList[i].contractId)
                            } catch (err) {
                              console.log('no account', err)
                            }
                            try{
                                thisCurDaoIdx = await ceramic.getCurrentDaoIdx(daoAccount, appIdx, didRegistryContract)
                                console.log('curdaoidx here', thisCurDaoIdx)
                            } catch (err) {
                                console.log('error getting dao idx', err)
                            }
                            if(thisCurDaoIdx){
                                try{
                                    singleDaoOpportunity = await thisCurDaoIdx.get('opportunities', thisCurDaoIdx.id)
                                    console.log('singledaoopp', singleDaoOpportunity)
                                } catch (err) {
                                    console.log('error loading singledao opportunity', err)
                                }

                                if(singleDaoOpportunity && Object.keys(singleDaoOpportunity).length > 0){
                                    let j = 0
                                    while (j < singleDaoOpportunity.opportunities.length){
                                    allOpportunities.push(singleDaoOpportunity.opportunities[j])
                                    j++
                                    }
                                }
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
                   
                  
                    while (j < allOpportunities.length){
                        let developerPercentage = 0
                        let developerSkillCount = 0
                        let developerSkillMatch = 0
                        let skillPercentage = 0
                        let skillCount = 0
                        let skillMatch = 0
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredDeveloperSkillSet)){
                            if(value){
                                developerSkillCount++
                                if(currentPersona.developerSkillSet){
                                    for (const [pkey, pvalue] of Object.entries(currentPersona.developerSkillSet)){
                                        if(pkey == key && pvalue == value){
                                            developerSkillMatch ++
                                        }
                                    }
                                }
                            }
                        }
                        for (const [key, value] of Object.entries(allOpportunities[j].desiredSkillSet)){
                            if(value){
                                skillCount++
                                if(currentPersona.skillSet){
                                    for (const [pkey, pvalue] of Object.entries(currentPersona.skillSet)){
                                        if(pkey == key && pvalue == value){
                                            skillMatch++
                                        }
                                    }
                                }
                            }
                        }
                        let asuitabilityScore = parseInt(((skillMatch + developerSkillMatch)/(skillCount + developerSkillCount)*100).toFixed(0))
                        if (!asuitabilityScore){
                            asuitabilityScore = 0
                        }
                        setSuitabilityScore(asuitabilityScore)
                        currentRecommendations.push({opportunity: allOpportunities[j], baseReward: parseInt(allOpportunities[j].reward), skillMatch: skillMatch, developerSkillMatch: developerSkillMatch, skillCount: skillCount, developerSkillCount: developerSkillCount, suitabilityScore: asuitabilityScore})
                        j++
                    }
                    
                    setRecommendations(currentRecommendations)
                    setRecommendationsLoaded(true)
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

    const handleOpportunityProposalDetailsClick = (proposer, opportunityId, rowContractId) => {
        handleExpanded()
        setOpportunityId(opportunityId)
        setProposer(proposer)
        setRowContractId(rowContractId)
        handleOpportunityProposalDetailsClickState(true)
      }
    
    function handleOpportunityProposalDetailsClickState(property){
    setOpportunityProposalDetailsClicked(property)
    }

    function handleExpanded() {
        setAnchorEl(null)
    }

    function handleUpdate(property){
        setIsUpdated(property)
    }

    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
          return -1;
        }
        if (b[orderBy] > a[orderBy]) {
          return 1;
        }
        return 0;
    }
      
    function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
    }
      
    function stableSort(array, comparator) {
        console.log('array', array)
    const stabilizedThis = array.map((el, index) => [el, index]);
    console.log('stabiizedthis', stabilizedThis)
    stabilizedThis.sort((a, b) => {
        console.log('sort a', a)
        console.log('sort b', b)
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    console.log('stabilized this', stabilizedThis)
    return stabilizedThis.map((el) => el[0]);
    }

    const headCells = [
        { id: 'name', numeric: false, disablePadding: true, label: 'Opportunity' },
        { id: 'suitabilityScore', numeric: true, disablePadding: false, label: 'Suitability' },
        { id: 'baseReward', numeric: true, disablePadding: false, label: 'Base Reward' },
    ]

    function EnhancedTableHead(props) {
        const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props
        const createSortHandler = (property) => (event) => {
          onRequestSort(event, property)
        }
      
        return (
          <TableHead>
            <TableRow key={'header'}>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <span className={classes.visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        );
      }
      
    EnhancedTableHead.propTypes = {
        classes: PropTypes.object.isRequired,
        onRequestSort: PropTypes.func.isRequired,
        order: PropTypes.oneOf(['asc', 'desc']).isRequired,
        orderBy: PropTypes.string.isRequired,
        rowCount: PropTypes.number.isRequired,
    }

    const handleRequestSort = (event, property) => {
        console.log('event', event)
        console.log('property', property)
        const isAsc = orderBy === property && order === 'asc'
            setOrder(isAsc ? 'desc' : 'asc')
            setOrderBy(property)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, recommendations.length - page * rowsPerPage)

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
            <Grid container justifyContent="center" alignItems="flex-start" spacing={1} >
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <MemberProfile member={accountId} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} align="center">
                
                <Typography variant="h6">Opportunities for You</Typography>
                <Typography variant="body1" style={{marginBottom: '10px'}}>The higher the suitability score, the more closely the opportunity matches your skillset</Typography>
               

                <div className={classes.root}>
      <Paper className={classes.paper}>
        
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={recommendations.length}
            />
            <TableBody>
                {recommendations && recommendations.length > 0 ?
                stableSort(recommendations, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  console.log('row', row)
                  console.log('index', index)
                  return (
                    <TableRow key={index}>
                      
                      <TableCell component="th" scope="row" padding="none">
                        <Button 
                            color="primary"
                            style={{fontWeight: '800', fontSize: '100%', lineHeight: '1.1em'}}
                            onClick={(e) => handleOpportunityProposalDetailsClick(row.opportunity.proposer, row.opportunity.opportunityId, row.opportunity.contractId)}
                            >{row.opportunity.title}
                        </Button>
                      </TableCell>
                      <TableCell align="right">{row.suitabilityScore}</TableCell>
                      <TableCell align="right">{row.baseReward}</TableCell>
                    </TableRow>
                    
                  )
                  
                }) :
              emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={3} />
                </TableRow>
              )
              }
            </TableBody>
            {opportunityProposalDetailsClicked ? <OpportunityProposalDetails
                proposer={proposer}
                handleOpportunityProposalDetailsClickState={handleOpportunityProposalDetailsClickState}
                applicant={accountId}
                handleUpdate={handleUpdate}
                opportunityId={opportunityId}
                contractId={rowContractId}
                /> : null }
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={recommendations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
    </div>

                
                       
                   
                </Grid>
            </Grid>
            </TabPanel>
            <TabPanel value="2">
                <div>
                <Grid container alignItems="center" justifyContent="center" spacing={1} style={{padding: '20px'}}>
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