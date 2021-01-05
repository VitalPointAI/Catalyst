import React, { useState, useEffect } from 'react'
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

export default function ProcessedTable(props) {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [proposalDetailsClicked, setProposalDetailsClicked] = useState(false)
    const [memberProposalId, setMemberProposalId] = useState('')
    const [expanded, setExpanded] = useState(false)
    const classes = useStyles()
    
    const { proposalList, 
        eventCount,
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
        
    },[])

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    function handleExpanded() {
        setExpanded(!expanded)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleProposalDetailsClick = async (id) => {
        handleExpanded()
        handleTabValueState('4')
        setMemberProposalId(id)
        setProposalDetailsClicked(true)
    };

    function handleProposalDetailsClickState(property) {
        setProposalDetailsClicked(property)
    }

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
                        <TableCell className={classes.cell} align="center"><div className={classes.cellText}><Button variant="contained" color="primary" onClick={(e) => handleProposalDetailsClick(row[0].requestId, e)}>Details</Button></div></TableCell>
                   
                                </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {proposalDetailsClicked ? <MemberProposalDetails
            contract={contract}
            memberProposalId={memberProposalId}
            handleProposalDetailsClickState={handleProposalDetailsClickState}  
            handleTabValueState={handleTabValueState}/> : null }
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