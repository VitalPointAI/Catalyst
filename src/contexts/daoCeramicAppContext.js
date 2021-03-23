import React, { useState, createContext, useEffect } from 'react'
import { IDX } from '@ceramicstudio/idx'

import { wallet } from '../utils/wallet'
import { ceramic } from '../utils/ceramic'
import { dao } from '../utils/dao'
import { dids } from '../utils/dids'
import { daoContractSend } from '../utils/daoContractSender'
import { factory } from '../utils/factory'

// SCHEMAS
import { profileSchema } from '../schemas/profile'
import { jweSchema } from '../schemas/jwe'
import { daoSeedsSchema } from '../schemas/daoSeeds'

export const DaoCeramicAppContext = createContext()

export default function DaoCeramicAppProvider(props) {

    const [appIdx, setAppIdx] = useState()
    const [appCeramicClient, setAppCeramicClient] = useState()
    const [appDID, setAppDID] = useState()
    const [didContract, setDIDContract] = useState()
    const [aliases, setAliases] = useState()
    const [accountId, setAccountId] = useState()
    const [curUserCeramicClient,  setCurUserCeramicClient] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [avatar, setAvatar] = useState()
    const [factoryContract, setFactoryContract] = useState()
    const [originContract, setOriginContract] = useState()
    const [daoList, setDaoList] = useState()

    useEffect(() => {

        async function initiate() {

          //  let thisAccountId
            let accountObj = await dao.loadAccountObject()
            console.log('accountobj', accountObj)
            
            if(accountObj){
             //   thisAccountId = accountObj.accountId
             //   setAccountId(thisAccountId)

                // Instantiate DIDs Contract
                let thisDIDsContract = await dids.loadDIDs(process.env.DIDS_CONTRACT)
                setDIDContract(thisDIDsContract)

                // Instantiate Factory Contract
                let daoName = accountObj.accountId.split('.')
                let dname = daoName[0]
                let thisfactoryContract = await factory.loadFactory(dname + '.' + process.env.FACTORY_CONTRACT)
                setFactoryContract(thisfactoryContract)

                let thisDaoContractSender = await daoContractSend.loadDAO(dname + '.' + process.env.FACTORY_CONTRACT)
                setOriginContract(thisDaoContractSender)

                // Load DAO List
                let list
                try {
                    list = await thisfactoryContract.getDaoList()
                } catch (err) {
                    console.log('problem retrieving Dao List', err)
                }
                setDaoList(list)

                // ******** IDX Initialization *********

                //Set App Ceramic Client
                let appSeed = Buffer.from(process.env.FACTORY_PRIV_KEY.slice(0, 32))
                let appAccount = await wallet.getAccount(process.env.FACTORY_CONTRACT)

                let appClient = await ceramic.getCeramic(appAccount, appSeed)
                setAppCeramicClient(appClient)

                let appDID = await ceramic.associateDAODID(appAccount, thisDIDsContract, appClient)
                setAppDID(appDID)

                // Associate app NEAR account with 3ID and store in contract and cache in local storage
                await ceramic.associateDID(appAccount.accountId, thisDIDsContract, appClient)

                // create app vault and definition if it doesn't exist
                await ceramic.schemaSetup(appAccount.accountId, 'jwe', 'encrypted seed', thisDIDsContract, appClient, jweSchema)
                await ceramic.schemaSetup(appAccount.accountId, 'SeedsJWE', 'encrypted dao seeds', thisDIDsContract, appClient, daoSeedsSchema)

                // Set Current User Ceramic Client                      
                let currentUserCeramicClient = await ceramic.getCeramic(accountObj)
                setCurUserCeramicClient(curUserCeramicClient)
            
                // Associate current user NEAR account with 3ID and store in contract and cache in local storage
                await ceramic.associateDID(accountObj.accountId, thisDIDsContract, currentUserCeramicClient)
            
                await ceramic.schemaSetup(accountObj.accountId, 'profile', 'user profile data', thisDIDsContract, currentUserCeramicClient, profileSchema)

                let currentAliases = {}
                try {
                    let allAliases = await thisDIDsContract.getAliases()
                
                    //reconstruct aliases and set IDXs
                    let i = 0
                    
                    while (i < allAliases.length) {
                        let key = allAliases[i].split(':')
                        let alias = {[key[0]]: key[1]}
                        currentAliases = {...currentAliases, ...alias}
                        i++
                    }
                    console.log('current aliases', currentAliases)
                    handleAliases(currentAliases)
                } catch (err) {
                    console.log('error retrieving aliases', err)
                }

                let appIdx = new IDX({ ceramic: appClient, aliases: currentAliases})
                setAppIdx(appIdx)

                let userIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: currentAliases})
                setCurUserIdx(userIdx)

                // Set Current User's Avatar
                let curInfo = await userIdx.get('profile')
                if(curInfo){
                    setAvatar(curInfo.avatar)
                }
                
            }
        }

         initiate()
         .then((res) => {
            
         })

     },[]
     )

    function handleAliases(newAliases){
        let tempAliases = {...aliases, ...newAliases}
        setAliases(tempAliases)
    }
    
   
    return (
        <DaoCeramicAppContext.Provider 
            value={{
                appIdx, 
                appCeramicClient, 
                appDID, 
                didContract, 
                aliases,
                avatar,
                factoryContract,
                originContract,
                curUserCeramicClient,
                curUserIdx,
                daoList,
                handleAliases
            }}>
            {props.children}
        </DaoCeramicAppContext.Provider>
    )
}