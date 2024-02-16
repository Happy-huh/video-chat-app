import { NavigateFunction } from "react-router-dom";
import {BreadCrumbsType} from './types'

export const getCreateMeetingBreadCrumbs = (navigate:NavigateFunction): Array<BreadCrumbsType>=> [
    {text:'Dashboard',href:'#',onClick:()=> {navigate("/")},},
    {text: 'Create Meeting'}
]
export const getOneOnOneMeetingBreadCrumbs = (navigate:NavigateFunction): Array<BreadCrumbsType>=> [
    {text:'Dashboard',href:'#',onClick:()=> {navigate("/")},},
    {text:'create meeting',href:'#',onClick:()=> {navigate("/createmeeting")},},
    {text: 'Create one on one Meeting'}
]
export const getVideoConfernceBreadCrumbs = (navigate:NavigateFunction): Array<BreadCrumbsType>=> [
    {text:'Dashboard',href:'#',onClick:()=> {navigate("/")},},
    {text:'create meeting',href:'#',onClick:()=> {navigate("/createmeeting")},},
    {text: 'Create video conference'}
]
export const getMyMeetingsBreadCrumbs = (navigate:NavigateFunction): Array<BreadCrumbsType>=> [
    {text:'Dashboard',href:'#',onClick:()=> {navigate("/")},},
    {text: 'My meetings'}
]
export const getMeetingsBreadCrumbs = (navigate:NavigateFunction): Array<BreadCrumbsType>=> [
    {text:'Dashboard',href:'#',onClick:()=> {navigate("/")},},
    {text: 'meetings'}
]