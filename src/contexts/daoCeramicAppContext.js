import React, { useState, createContext, useEffect } from 'react'
import { get, set, del } from '../utils/storage'
import { IDX } from '@ceramicstudio/idx'
import * as nearApiJs from 'near-api-js'
import getConfig from '../utils/config'

import { wallet } from '../utils/wallet'
import { ceramic } from '../utils/ceramic'
import { dao } from '../utils/dao'
import { dids } from '../utils/dids'
import { daoContractSend } from '../utils/daoContractSender'
import { factory } from '../utils/factory'

// SCHEMAS
import { profileSchema } from '../schemas/profileold'
import { jweSchema } from '../schemas/jwe'
import { daoSeedsSchema } from '../schemas/daoSeeds'

export const DaoCeramicAppContext = createContext()

export default function DaoCeramicAppProvider(props) {

    const [appIdx, setAppIdx] = useState()
    const [appDidContract, setAppDidContract] = useState()
    const [didContract, setDidContract] = useState()
    const [accountId, setAccountId] = useState()
    const [curUserIdx, setCurUserIdx] = useState()
    const [factoryContract, setFactoryContract] = useState()
    const [originContract, setOriginContract] = useState()
    const [daoList, setDaoList] = useState()
    const [curInfo, setCurInfo] = useState()
    const [near, setNear] = useState()

    useEffect(() => {

        async function initiate() {

            const nearConfig = getConfig(process.env.NODE_ENV || 'testnet')
            const near = await nearApiJs.connect(Object.assign({ deps: { keyStore: wallet.keyStore } }, nearConfig))
            setNear(near)

          //  let thisAccountId
            let accountObj = await dao.loadAccountObject()
            console.log('accountobj', accountObj)
            
            if(accountObj){
             //   thisAccountId = accountObj.accountId
             //   setAccountId(thisAccountId)

                // Instantiate Factory Contract
                let daoName = accountObj.accountId.split('.')
                let dname = daoName[0]
                let thisfactoryContract = await factory.loadFactory(dname + '.' + process.env.FACTORY_CONTRACT)
                console.log('thisfactoryContract', thisfactoryContract)
                setFactoryContract(thisfactoryContract)

                let thisDaoContractSender = await daoContractSend.loadDAO(dname + '.' + process.env.FACTORY_CONTRACT)
                setOriginContract(thisDaoContractSender)

                // Load DAO List
                let list
                try {
                    list = await thisfactoryContract.getDaoList()
                    console.log('list', list)
                } catch (err) {
                    console.log('problem retrieving Dao List', err)
                }
                setDaoList(list)

                // ********* Initiate Dids Registry Contract ************

                const appAccount = await wallet.getAccount(process.env.APP_OWNER_ACCOUNT)
                console.log('appAccount', appAccount)

                const appAccountId = appAccount.accountId
                console.log('appAccountId', appAccountId)
                setAccountId(appAccountId)
            
                const appDidRegistryContract = await ceramic.initiateDidRegistryContract(appAccount)
                console.log('appDidRegistryContract', appDidRegistryContract)
                setAppDidContract(appDidRegistryContract)

                //Initiate App Ceramic Components
    
                const appIdx = await ceramic.getAppIdx(appDidRegistryContract)
                console.log('appIdx', appIdx)
                setAppIdx(appIdx)


                // Set Current User Ceramic Client

                let curUserIdx
                let did

                let signedInAccount = await wallet.loadAccount()
                console.log('signedinaccount', signedInAccount)
                let curUserAccount = await wallet.getAccount(signedInAccount.accountId)
                console.log('curuseraccount', curUserAccount)
                let curUserAccountId = signedInAccount.accountId
                console.log('curuseraccountid', curUserAccountId)

                const didRegistryContract = await ceramic.initiateDidRegistryContract(curUserAccount)
                console.log('didRegistryContract', didRegistryContract)
                setDidContract(didRegistryContract)
                
                let existingDid = await didRegistryContract.hasDID({accountId: curUserAccountId})
                console.log('existingDID', existingDid)
            
                if(existingDid){
                    did = await didRegistryContract.getDID({
                        accountId: curUserAccountId
                    })
                    let ownerAccounts = get(nearConfig.ACCOUNT_LINKS, [])
                
                    let b = 0
                    let owner
                    while(b < ownerAccounts.length) {
                        if(ownerAccounts[b].accountId == curUserAccountId){
                            owner = ownerAccounts[b].owner
                            break
                        }
                    b++
                    }
                    console.log('owner', owner)
                    if(owner != undefined){
                        const ownerAccount = new nearApiJs.Account(near.connection, owner)
                        const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, didRegistryContract, owner)
                        console.log('ownerIdx', ownerIdx)
                        curUserIdx = await ceramic.getCurrentUserIdx(curUserAccount, appIdx, didRegistryContract, owner, ownerIdx)
                        console.log('did curUseridx', curUserIdx)
                        setCurUserIdx(curUserIdx)
                    } else {
                        curUserIdx = await ceramic.getCurrentUserIdx(curUserAccount, appIdx, didRegistryContract)
                        console.log('owner did curUserIdx', curUserIdx)
                        setCurUserIdx(curUserIdx)
                    }
                    
                }
                if(!existingDid){
                    curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, curUserAccount)
                    console.log('no did curUserIdx', curUserIdx)
                    setCurUserIdx(curUserIdx)
                }
                
                // Set Current User's Info
                const curInfo = await curUserIdx.get('profile')
                setCurInfo(curInfo)
                console.log('curInfo', curInfo)
               
                // let curUserIdx
                // let did
            
                // let existingDid = await didRegistryContract.hasDID({accountId: appAccountId})
                // console.log('existingDID', existingDid)

                // if(existingDid){
                //     did = await didRegistryContract.getDID({
                //         accountId: appAccountId
                //     })
                //     console.log('did', did)
                //     let ownerAccounts = get(ACCOUNT_LINKS, [])
                //     console.log('ownerAccounts', ownerAccounts)
                    
                //     let b = 0
                //     let owner
                //     while(b < ownerAccounts.length) {
                //         if(ownerAccounts[b].accountId == appAccountId){
                //             owner = ownerAccounts[b].owner
                //             break
                //         }
                //     b++
                //     }
                //     console.log('owner', owner)
                //     if(owner != undefined){
                //         const ownerAccount = new nearApiJs.Account(near.connection, owner)
                //         const ownerIdx = await ceramic.getCurrentUserIdx(ownerAccount, appIdx, didRegistryContract, owner)
                //         curUserIdx = await ceramic.getCurrentUserIdx(appAccount, appIdx, didRegistryContract, owner, ownerIdx)
                //         console.log('owner curUserIdx', curUserIdx)
                //         setCurUserIdx(curUserIdx)
                //     } else {
                //         curUserIdx = await ceramic.getCurrentUserIdx(appAccount, appIdx, didRegistryContract)
                //         console.log('no owner curUserIdx', curUserIdx)
                //         setCurUserIdx(curUserIdx)
                //     }
                    
                // }
                // if(!existingDid){
                //     curUserIdx = await ceramic.getCurrentUserIdxNoDid(appIdx, didRegistryContract, appAccount)
                //     console.log('no did curuserIdx', curUserIdx)
                //     setCurUserIdx(curUserIdx)
                // }
                
                // // Set Current User's Info
                // const curInfo = await curUserIdx.get('profile')
                // console.log('curInfo', curInfo)
                

                // ********* Initiate Dids Registry Contract ************

                // const thisAccountId = accountObj.accountId
                // setAccountId(thisAccountId)
                
                // let appAccount = await wallet.getAccount(process.env.FACTORY_CONTRACT)
                // console.log('appAccount', appAccount)
                // const didRegistryContract = await ceramic.initiateDidRegistryContract(appAccount)
                // console.log('didRegistryContract', didRegistryContract)
                // setDIDContract(didRegistryContract)

                // ******** IDX Initialization *********

                //Initiate App Ceramic Components
                
               // const appIdxa = await ceramic.getAppIdx(didRegistryContract)
               // const account = accountObj
               // setAppIdx(appIdxa)

                // Set Current User Ceramic Client

                // let curUserIdxa
                // let did
                // let existingDid = await didRegistryContract.hasDID({accountId: thisAccountId})
                // if(existingDid){
                //     did = await didRegistryContract.getDID({
                //         accountId: thisAccountId
                //     })
                //     curUserIdxa = await ceramic.getCurrentUserIdx(account, didRegistryContract, appIdxa, did)
                //     setCurUserIdx(curUserIdxa)
                // }
                // if(!existingDid){
                //     curUserIdxa = await ceramic.getCurrentUserIdxNoDid(appIdxa, didRegistryContract, account)
                //     setCurUserIdx(curUserIdxa)
                // }
                
                // // Set Current User's Info
                // const curInfoa = await curUserIdxa.get('profile')
                // console.log('curinfo', curInfoa)
                // setCurInfo(curInfoa)

                // ******** IDX Initialization *********

            //     //Set App Ceramic Client
            //     let appSeed = Buffer.from(process.env.FACTORY_PRIV_KEY.slice(0, 32))
            //     let appAccount = await wallet.getAccount(process.env.FACTORY_CONTRACT)
            //     console.log('appAccount', appAccount)

            //     let appClient = await ceramic.getCeramic(appAccount, appSeed)
            //     setAppCeramicClient(appClient)

            //     let appDID = await ceramic.associateAppDID(appAccount.accountId, thisDIDsContract, appClient)
            //     setAppDID(appDID)

            //     // Associate app NEAR account with 3ID and store in contract and cache in local storage
            //     // await ceramic.associateDID(appAccount.accountId, thisDIDsContract, appClient)

            //     // create app vault and definition if it doesn't exist
            //     await ceramic.schemaSetup(appAccount.accountId, 'jwe', 'encrypted seed', thisDIDsContract, appClient, jweSchema)
            //     console.log('here')
            //     await ceramic.schemaSetup(appAccount.accountId, 'SeedsJWE', 'encrypted dao seeds', thisDIDsContract, appClient, daoSeedsSchema)

            //     // Set Current User Ceramic Client                      
            //     let currentUserCeramicClient = await ceramic.getCeramic(accountObj)
            //     setCurUserCeramicClient(curUserCeramicClient)
            
            //     // Associate current user NEAR account with 3ID and store in contract and cache in local storage
            //     await ceramic.associateDID(accountObj.accountId, thisDIDsContract, currentUserCeramicClient)
            
            //    // await ceramic.schemaSetup(accountObj.accountId, 'profile', 'user profile data', thisDIDsContract, currentUserCeramicClient, profileSchema)

            //     let currentAliases = {}
            //     try {
            //         let allAliases = await thisDIDsContract.getAliases()
            //         console.log('all aliases', allAliases)
            //         //reconstruct aliases and set IDXs
            //         let i = 0
                    
            //         while (i < allAliases.length) {
            //             let key = allAliases[i].split(':')
            //             let alias = {[key[0]]: key[1]}
            //             currentAliases = {...currentAliases, ...alias}
            //             i++
            //         }
            //         console.log('current aliases', currentAliases)
            //         handleAliases(currentAliases)
            //     } catch (err) {
            //         console.log('error retrieving aliases', err)
            //     }

            //     let thisAppIdx = new IDX({ ceramic: appClient, aliases: currentAliases})
            //     setAppIdx(thisAppIdx)

            //     console.log('thisappidx', thisAppIdx)
            //     let userIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: currentAliases})
            //     setCurUserIdx(userIdx)
            //     console.log('curuseridx', userIdx)
                // Set Current User's Avatar
             //   let curInfo = await userIdx.get('profile')
             //   if(curInfo){
             //       setAvatar(curInfo.avatar)
             //   }
                
            }
        }

         initiate()
         .then((res) => {
            
         })

     },[]
     )

    // function handleAliases(newAliases){
    //     let tempAliases = {...aliases, ...newAliases}
    //     setAliases(tempAliases)
    // }
    
   
    return (
        <DaoCeramicAppContext.Provider 
            value={{
                appIdx,
                appDidContract,
                didContract, 
                curInfo,
                factoryContract,
                originContract,
                curUserIdx,
                accountId,
                daoList,
                near   
            }}>
            {props.children}
        </DaoCeramicAppContext.Provider>
    )
}