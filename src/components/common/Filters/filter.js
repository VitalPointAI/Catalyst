import React from 'react'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'

export default function Filter(props){

    const {
        tabValue
    } = props

    const matches = useMediaQuery('(max-width:500px)')

    const [onlyFundingCommitmentProposals, setOnlyFundingCommitmentProposals] = useState(true)
    const [onlyPayoutProposals, setOnlyPayoutProposals] = useState(true)
    const [onlyCancelCommitmentProposals, setOnlyCancelCommitmentProposals] = useState(true)
    const [onlyMemberProposals, setOnlyMemberProposals] = useState(true)
    const [onlyOpportunityProposals, setOnlyOpportunityProposals] = useState(true)
    const [onlyWhiteListProposals, setOnlyWhiteListProposals] = useState(true)
    const [onlyGuildKickProposals, setOnlyGuildKickProposals] = useState(true)
    const [onlyTributeProposals, setOnlyTributeProposals] = useState(true)
    const [onlyConfigurationProposals, setOnlyConfigurationProposals] = useState(true)
    const [onlyReputationFactorProposals, setOnlyReputationFactorProposals] = useState(true)
    const [onlyAssignRoleProposals, setOnlyAssignRoleProposals] = useState(true)
    const [onlyCommunityRoleProposals, setOnlyCommunityRoleProposals] = useState(true)
    const [onlyYourProposals, setOnlyYourProposals] = useState(tabValue == '5' ? true : false)

    const handleOnlyMemberProposalChange = (event) => {
        setOnlyMemberProposals(event.target.checked)
    }

    const handleOnlyFundingCommitmentProposalChange = (event) => {
        setOnlyFundingCommitmentProposals(event.target.checked)
    }

    const handleOnlyPayoutProposalChange = (event) => {
        setOnlyPayoutProposals(event.target.checked)
    }

    const handleOnlyCancelCommitmentProposalChange = (event) => {
        setOnlyCancelCommitmentProposals(event.target.checked)
    }

    const handleOnlyConfigurationProposalChange = (event) => {
        setOnlyConfigurationProposals(event.target.checked)
    }

    const handleOnlyTributeProposalChange = (event) => {
        setOnlyTributeProposals(event.target.checked)
    }

    const handleOnlyCommunityRoleProposalChange = (event) => {
        setOnlyCommunityRoleProposals(event.target.checked)
    }

    const handleOnlyAssignRoleProposalChange = (event) => {
        setOnlyAssignRoleProposals(event.target.checked)
    }

    const handleOnlyWhitelistProposalChange = (event) => {
        setOnlyWhiteListProposals(event.target.checked)
    }

    const handleOnlyGuildKickProposalChange = (event) => {
        setOnlyGuildKickProposals(event.target.checked)
    }

    const handleOnlyReputationFactorProposalChange = (event) => {
        setOnlyReputationFactorProposals(event.target.checked)
    }

    const handleOnlyOpportunityProposalChange = (event) => {
        setOnlyOpportunityProposals(event.target.checked)
    }

    const handleOnlyYourProposalChange = (event) => {
        setOnlyYourProposals(event.target.checked)
    }

    return (
        <FormControl component="fieldset" >
        <FormLabel component="legend">Filter Proposals</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={onlyYourProposals} onChange={handleOnlyYourProposalChange} name="onlyYourProposals" />}
            label="Only Your Proposals"
          />
          <FormControlLabel
            control={<Switch checked={onlyMemberProposals} onChange={handleOnlyMemberProposalChange} name="onlyMemberProposals" />}
            label="Members"
          />
          <FormControlLabel
            control={<Switch checked={onlyFundingCommitmentProposals} onChange={handleOnlyFundingCommitmentProposalChange} name="onlyFundingCommitmentProposals" />}
            label="Funding Commitments"
          />
          <FormControlLabel
            control={<Switch checked={onlyPayoutProposals} onChange={handleOnlyPayoutProposalChange} name="onlyPayoutProposals" />}
            label="Payouts"
          />
          <FormControlLabel
            control={<Switch checked={onlyOpportunityProposals} onChange={handleOnlyOpportunityProposalChange} name="onlyOpportunityProposals" />}
            label="Opportunities"
          />
          <FormControlLabel
            control={<Switch checked={onlyConfigurationProposals} onChange={handleOnlyConfigurationProposalChange} name="onlyConfigurationProposals" />}
            label="Configuration"
          />
          <FormControlLabel
            control={<Switch checked={onlyTributeProposals} onChange={handleOnlyTributeProposalChange} name="onlyTributeProposals" />}
            label="Contributions"
          />
          <FormControlLabel
            control={<Switch checked={onlyCommunityRoleProposals} onChange={handleOnlyCommunityRoleProposalChange} name="onlyCommunityRoleProposals" />}
            label="Community Role"
          />
          <FormControlLabel
            control={<Switch checked={onlyAssignRoleProposals} onChange={handleOnlyAssignRoleProposalChange} name="onlyAssignRoleProposals" />}
            label="Assign Role"
          />
          <FormControlLabel
            control={<Switch checked={onlyReputationFactorProposals} onChange={handleOnlyReputationFactorProposalChange} name="onlyReputationFactorProposals" />}
            label="Reputation Factor"
          />
          <FormControlLabel
            control={<Switch checked={onlyWhiteListProposals} onChange={handleOnlyWhitelistProposalChange} name="onlyWhiteListProposals" />}
            label="Whitelist"
          />
          <FormControlLabel
            control={<Switch checked={onlyGuildKickProposals} onChange={handleOnlyGuildKickProposalChange} name="onlyGuildKickProposals" />}
            label="GuildKick"
          /> 
          <FormControlLabel
            control={<Switch checked={onlyCancelCommitmentProposals} onChange={handleOnlyCancelCommitmentProposalChange} name="onlyCancelCommitmentProposals" />}
            label="Cancel Commitments"
          />
        </FormGroup>
        <FormHelperText>Choose the proposal types you want.</FormHelperText>
      </FormControl>
    )
}