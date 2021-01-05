import React, { useState, useEffect } from 'react'
import RageQuit from '../RageQuit/rageQuit'
import MemberProposalDetails from '../MemberProposal/memberProposalDetails'

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
import ButtonGroup from '@material-ui/core/ButtonGroup'
import ThumbDownAlt from '@material-ui/icons/ThumbDownAlt'
import ThumbUpAlt from '@material-ui/icons/ThumbUpAlt'
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

export default function VotingListTable(props) {
    const [page, setPage] = useState(0)
    const [voted, setVoted] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [rageQuitClicked, setRageQuitClicked] = useState(false)
    const [proposalDetailsClicked, setProposalDetailsClicked] = useState(false)
    const [memberProposalId, setMemberProposalId] = useState('')
    const [expanded, setExpanded] = useState(false)
    const classes = useStyles()
    
    const { proposalList, 
        eventCount,
        currentPeriod,
        periodDuration,
        handleProposalEventChange,
        accountId,
        handleTabValueState,
        contract
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

    const handleRageQuitClick = () => {
        handleExpanded()
        setRageQuitClicked(true)
    };

    function handleRageQuitClickState(property) {
        setRageQuitClicked(property)
    }

    function handleExpanded() {
        setExpanded(!expanded)
    }

    const handleProposalDetailsClick = async (id) => {
            handleExpanded()
            handleTabValueState('2')
            setMemberProposalId(id)
            setProposalDetailsClicked(true)
    };

    function handleProposalDetailsClickState(property) {
        setProposalDetailsClicked(property)
    }

    async function handleYesVotingAction(proposalIdentifier) {
        await contract.submitVote({
            pI: proposalIdentifier,
            vote: 'yes'
            }, process.env.DEFAULT_GAS_VALUE)
        await handleProposalEventChange()
           
    }

    async function handleNoVotingAction(proposalIdentifier) {
        await contract.submitVote({
            pI: proposalIdentifier,
            vote: 'no'
            }, process.env.DEFAULT_GAS_VALUE)
            await handleProposalEventChange()
    }

    return (
        <>
        
        <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
            <TableRow>
               
                <TableCell className={classes.cell} align="center">Proposal Type</TableCell>
                
                <TableCell className={classes.cell} align="center">Applicant</TableCell>
                <TableCell className={classes.cell} align="center">Shares</TableCell>
                <TableCell className={classes.cell} align="center">Loot</TableCell>
                <TableCell className={classes.cell} align="center">Tribute</TableCell>
                <TableCell className={classes.cell} align="center"></TableCell>
                <TableCell className={classes.cell} align="center">Vote Counts</TableCell>
                <TableCell className={classes.cell} align="center"></TableCell>
             
            </TableRow>
            </TableHead>
            <TableBody>
          {proposalList.length == 0 ? <TableRow ><TableCell colSpan={7} className={classes.cell} align="center"><div className={classes.cellText}>Nothing ready for voting yet</div></TableCell></TableRow> : null}
            {(rowsPerPage > 0 
                ? proposalList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
                : proposalList
                ).map((row) => (
                  
                    <TableRow key={row[0].requestId}>
                   {console.log('row ', row[0].voted)}
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].proposalType}</div></TableCell>
                   
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].applicant}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                    {row[0].proposalType=='Member' ? row[0].shares : '0'}
                    </div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                    {row[0].proposalType!='Member' ? row[0].loot : '0'}
                    </div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].tribute}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}><Button variant="contained" color="primary" onClick={(e) => handleProposalDetailsClick(row[0].requestId, e)}>Details</Button></div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>Yes:{row[0].yesVotes} | No:{row[0].noVotes}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                   <div>{row[0].status == 'Sponsored' && !row[0].isVotingPeriod && row[0].isGracePeriod && row[0].voted ? 'Finalizing': null} </div>
                    {row[0].status == 'Sponsored' && row[0].isVotingPeriod && !row[0].isGracePeriod ? 
                    <>
                        <ButtonGroup disabled={row[0].voted} disableElevation={false} orientation="vertical" aria-label="vertical contained primary button group">
                            <Button variant="contained" color="primary" startIcon={<ThumbUpAlt />} onClick={(e) => handleYesVotingAction(row[0].requestId, e)}>Yes</Button>
                            <Button variant="contained"  color="secondary" startIcon={<ThumbDownAlt />} onClick={(e) => handleNoVotingAction(row[0].requestId, e)}>No</Button>
                        </ButtonGroup>
                        <div className={classes.cellText}>Voting Ends in {((row[0].votingPeriod - currentPeriod)+1) * periodDuration / 60} minutes</div>
                    </>
                        : null }

                    {row[0].status == 'Sponsored' && row[0].isGracePeriod && !row[0].isVotingPeriod && row[0].vote != 'yes' ?
                    <>
                        <ButtonGroup disabled={false} disableElevation={false} orientation="vertical" aria-label="vertical contained primary button group">
                            <Button variant="contained"  color="secondary" startIcon={<ThumbDownAlt />} onClick={handleRageQuitClick}>RageQuit</Button>
                        </ButtonGroup>
                        <div className={classes.cellText}>RageQuit ends in {((row[0].gracePeriod - currentPeriod)+1) * periodDuration / 60} {(((row[0].gracePeriod - currentPeriod)+1) * periodDuration / 60) > 1 ? 'minutes':'minute'}</div>
                    </>
                    : null }

                    </div></TableCell>
                       </TableRow>
                    
                ))}
            </TableBody>
        </Table>
        {rageQuitClicked ? <RageQuit
            contract={contract}
            handleProposalEventChange={handleProposalEventChange}
            handleRageQuitClickState={handleRageQuitClickState}
            accountId={accountId}
            /> : null }
        {proposalDetailsClicked ? <MemberProposalDetails
            contract={contract}
            memberProposalId={memberProposalId}
            handleProposalDetailsClickState={handleProposalDetailsClickState}  
            handleTabValueState={handleTabValueState}/> : null }
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
    </>
    )
}