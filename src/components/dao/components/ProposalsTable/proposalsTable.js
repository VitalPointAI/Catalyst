import React, { useState, useEffect } from 'react'
import { utils } from 'near-api-js'
import { daoContractSend } from '../../../../utils/daoContractSender'
import MemberProposalForm from '../MemberProposal/memberProposalForm'
import MemberProposalDetails from '../MemberProposal/memberProposalDetails'
import FundingProposalForm from '../FundingProposal/fundingProposalForm'
import FundingProposalDetails from '../FundingProposal/fundingProposalDetails'
import { deleteAppRecord, deleteRecord, retrieveRecord } from '../../../../utils/threadsDB';


// Material UI Components
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import Big from 'big.js'

const useStyles = makeStyles({
  table: {
  },
  cell: {
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 5,
      paddingRight: 0,
      maxWidth: 70,
  },
  cellText: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%'
  }
});

const BOATLOAD_OF_GAS = Big(3).times(10 ** 14).toFixed()

export default function ProposalsTable(props) {

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [proposalsList, setProposalsList] = useState([])
    const [memberProposalDetailsClicked, setMemberProposalDetailsClicked] = useState(false)
    const [memberProposalDetailsEmptyClicked, setMemberProposalDetailsEmptyClicked] = useState(false)
    const [memberProposalId, setMemberProposalId] = useState('')
    const [fundingProposalDetailsClicked, setFundingProposalDetailsClicked] = useState(false)
    const [fundingProposalDetailsEmptyClicked, setFundingProposalDetailsEmptyClicked] = useState(false)
    const [fundingProposalId, setFundingProposalId] = useState('')
    const [memberProposalProposer, setMemberProposalProposer] = useState('')
    const [memberProposalApplicant, setMemberProposalApplicant] = useState('')
    const [memberProposalIntro, setMemberProposalIntro] = useState('')
    const [memberProposalAvatar, setMemberProposalAvatar] = useState()
    const [memberProposalPublished, setMemberProposalPublished] = useState()
    const [expanded, setExpanded] = useState(false)

    const classes = useStyles()
    
    const { proposalList, 
        eventCount, 
        matches, 
        accountId, 
        loaded,
        memberStatus,
        depositToken,
        tributeToken,
        tributeOffer,
        processingReward,
        proposalDeposit,
        currentPeriod,
        proposalComments,
        handleProposalCountChange,
        handleProposalEventChange,
        handleEscrowBalanceChanges,
        handleGuildBalanceChanges,
        handleUserBalanceChanges,
        handleTabValueState,
        contract,
        daoContract
     } = props
    

    useEffect(() => {
        async function fetchData() {
          
        }
       
        fetchData()
          .then((res) => {
            console.log('res', res)
          })
        
    },[proposalList])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function handleExpanded() {
        setExpanded(!expanded)
    }

    const handleMemberProposalDetailsClick = async (id, applicant) => {
        if(accountId != applicant) {
            handleExpanded()
            handleTabValueState('1')
            setMemberProposalId(id)
            setMemberProposalDetailsClicked(true)
        } else {
            handleExpanded()
            handleTabValueState('1')
            setMemberProposalId(id)
            setMemberProposalDetailsEmptyClicked(true)
        }
    };

    function handleMemberProposalDetailsClickState(property) {
        setMemberProposalDetailsClicked(property)
      }
      
    function handleMemberProposalDetailsEmptyClickState(property) {
    setMemberProposalDetailsEmptyClicked(property)
    }

    const handleFundingProposalDetailsClick = async (id, applicant) => {
        if(accountId != applicant) {
            handleExpanded()
            handleTabValueState('1')
            setFundingProposalId(id)
            setFundingProposalDetailsClicked(true)
        } else {
            handleExpanded()
            handleTabValueState('1')
            setFundingProposalId(id)
            setFundingProposalDetailsEmptyClicked(true)
        }
    };

    function handleFundingProposalDetailsClickState(property) {
        setFundingProposalDetailsClicked(property)
      }
      
    function handleFundingProposalDetailsEmptyClickState(property) {
    setFundingProposalDetailsEmptyClicked(property)
    }

    async function handleSponsorAction(proposalIdentifier) {
       await contract.sponsorProposal({
            pI: proposalIdentifier,
            proposalDeposit: proposalDeposit,
            depositToken: depositToken
            }, process.env.DEFAULT_GAS_VALUE)
           await handleProposalEventChange()
           await handleEscrowBalanceChanges()
           await handleGuildBalanceChanges()
           await handleUserBalanceChanges()
      };

    async function handleCancelAction(proposalIdentifier, tribute) {
       
        await daoContract.cancelProposal({
            pI: proposalIdentifier
            }, process.env.DEFAULT_GAS_VALUE, utils.format.parseNearAmount((parseInt(proposalDeposit)+parseInt(tribute)).toString()))
           
            await handleProposalEventChange()
            await handleEscrowBalanceChanges()
            await handleGuildBalanceChanges()
            await handleUserBalanceChanges()
        };

    return (
        <>
        
        <TableContainer component={Paper}>
            <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                <TableRow>
                    <TableCell className={classes.cell}>Date</TableCell>
                    <TableCell className={classes.cell} align="center">Proposal Type</TableCell>
                    <TableCell className={classes.cell} align="center">Status</TableCell>
                    <TableCell className={classes.cell} align="center">Applicant</TableCell>
                    <TableCell className={classes.cell} align="center">Shares</TableCell>
                    <TableCell className={classes.cell} align="center">Loot</TableCell>
                    <TableCell className={classes.cell} align="center">Tribute</TableCell>
                    <TableCell className={classes.cell} align="center"></TableCell>
                    <TableCell className={classes.cell} align="center"></TableCell>
                    <TableCell className={classes.cell} align="center"></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
              
                {(rowsPerPage > 0 
                    ? proposalList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
                    : proposalList
                    ).map((row) => (
                        <TableRow key={row[0].requestId}>
                        <TableCell className={classes.cell} component="th" scope="row[0]" size='small' align="left">
                            <div className={classes.cellText}>{row[0].date}</div>
                        </TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].proposalType}</div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].status}</div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].applicant}</div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                        {row[0].proposalType=='Member' ? row[0].shares : '0'}
                        </div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                        {row[0].proposalType!='Member' ? row[0].loot : '0'}
                        </div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].tribute}</div></TableCell>
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                            {row[0].proposalType === 'Member' ? <Button variant="contained" color="primary" onClick={(e) => handleMemberProposalDetailsClick(row[0].requestId, row[0].applicant, e)}>Details</Button> : null }
                            {row[0].proposalType === 'Funding' ? <Button variant="contained" color="primary" onClick={(e) => handleFundingProposalDetailsClick(row[0].requestId, row[0].applicant, e)}>Details</Button> : null }
                        </div></TableCell> 
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                            {row[0].status == 'Submitted' && accountId == row[0].proposer ? <Typography variant="caption" display="block">Awaiting Sponsor</Typography> : null}
                            {(accountId != row[0].proposer && accountId != row[0].applicant) && row[0].status=='Submitted' ? <Button variant="contained" color="primary" onClick={(e) => handleSponsorAction(row[0].requestId, e)}>Sponsor</Button> : null}
                        </div></TableCell>
                            {(accountId == row[0].proposer || (accountId == row[0].applicant && row[0].proposalType != 'GuildKick')) && row[0].status=='Submitted' ? <TableCell className={classes.cell} align="center"><div className={classes.cellText}><Button variant="contained" color="primary" onClick={() => handleCancelAction(row[0].requestId, row[0].tribute)}>Cancel</Button> </div></TableCell>: null } 
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={eventCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
        />
        {memberProposalDetailsEmptyClicked ? <MemberProposalForm
            contract={contract}
            memberProposalId={memberProposalId}
            accountId={accountId}
            handleProposalDetailsEmptyClickState={handleMemberProposalDetailsEmptyClickState}  
            handleTabValueState={handleTabValueState}/> : null }
        {memberProposalDetailsClicked ? <MemberProposalDetails
            contract={contract}
            memberStatus={memberStatus}
            memberProposalId={memberProposalId}
            proposalComments={proposalComments}
            handleProposalDetailsClickState={handleMemberProposalDetailsClickState}  
            handleTabValueState={handleTabValueState}/> : null }
        {fundingProposalDetailsEmptyClicked ? <FundingProposalForm
            contract={contract}
            fundingProposalId={fundingProposalId}
            accountId={accountId}
            handleProposalDetailsEmptyClickState={handleFundingProposalDetailsEmptyClickState}  
            handleTabValueState={handleTabValueState}/> : null }
        {fundingProposalDetailsClicked ? <FundingProposalDetails
            contract={contract}
            memberStatus={memberStatus}
            fundingProposalId={fundingProposalId}
            proposalComments={proposalComments}
            handleProposalDetailsClickState={handleFundingProposalDetailsClickState}  
            handleTabValueState={handleTabValueState}/> : null }
    </>
    )
}