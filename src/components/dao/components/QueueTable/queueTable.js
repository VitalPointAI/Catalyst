import React, { useState, useEffect } from 'react'

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


export default function QueueTable(props) {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const classes = useStyles()
    
    const { proposalList, 
        eventCount,
        handleProposalEventChange,
        handleEscrowBalanceChanges,
        handleGuildBalanceChanges,
        handleUserBalanceChanges,
        contract,
        accountId
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

    async function handleProcessAction(proposalIdentifier) {
       let passed = await contract.processProposal({
            pI: proposalIdentifier
            }, process.env.DEFAULT_GAS_VALUE)
     
            await handleProposalEventChange()
            await handleGuildBalanceChanges()
            await handleEscrowBalanceChanges()
            await handleUserBalanceChanges()
           
    };

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
                <TableCell className={classes.cell} align="center">Identifier</TableCell>
                <TableCell className={classes.cell} align="center"></TableCell>
             
            </TableRow>
            </TableHead>
            <TableBody>
          
            {(rowsPerPage > 0 
                ? proposalList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
                : proposalList
                ).map((row) => (
                   
                    <TableRow key={row[0].requestId}>
                  {console.log('queue row ', row)}
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].proposalType}</div></TableCell>
                   
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].applicant}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                    {row[0].proposalType=='Member' ? row[0].shares : '0'}
                    </div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                    {row[0].proposalType!='Member' ? row[0].loot : '0'}
                    </div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].tribute}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>{row[0].requestId}</div></TableCell>
                    <TableCell className={classes.cell} align="center"><div className={classes.cellText}>
                      {accountId != row[0].proposer && row[0].status == 'Sponsored' && row[0].isVotingPeriod == false && row[0].isGracePeriod == false ? <Button variant="contained" color="primary" onClick={() => handleProcessAction(row[0].requestId)}>Process</Button> : null}
                    </div></TableCell>
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
    </>
    )
}