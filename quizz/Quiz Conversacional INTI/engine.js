import {questions,patterns,costs,skills,directions,reactions,emotionalMirror} from './content.js';
export const stages=['intro','situation','pattern','reaction','cost','mirror','intention','result','invitation','done'];
export const createSession=()=>({theme:'Ele faz você duvidar de si?',answers:{},relationship_pattern:null,reaction_style:null,emotional_cost:null,desired_direction:null,primary_skill:null,stage:'intro',history:[],resultSeen:false});
const fields={situation:'relationship_pattern',reaction:'reaction_style',cost:'emotional_cost',intention:'desired_direction'};
const after={situation:'pattern',reaction:'cost',cost:'mirror',intention:'result'};
export function answer(session,key,value){
 if(!questions[key]?.options.some(o=>o[0]===value))return structuredClone(session);
 const s=structuredClone(session),order=Object.keys(fields),at=order.indexOf(key);
 for(const later of order.slice(at+1)){delete s.answers[later];s[fields[later]]=null;}
 s.answers[key]=value;s[fields[key]]=value;s.resultSeen=false;
 s.primary_skill=costs[s.emotional_cost]?.skill||null;
 s.history=s.history.filter(h=>order.indexOf(h.stage)<at);s.history.push({stage:key,answer:value});
 s.stage=after[key];return s;
}
export function advance(session){
 const s=structuredClone(session);
 const next={intro:'situation',pattern:'reaction',mirror:'intention',result:'invitation'};
 if(s.stage==='result'&&getResult(s))s.resultSeen=true;
 s.stage=next[s.stage]||s.stage;
 if(s.stage==='invitation'&&(!s.resultSeen||!getResult(s)))s.stage='result';
 return s;
}
export function getResult(s){
 const pattern=patterns[s.relationship_pattern],cost=costs[s.emotional_cost],direction=directions[s.desired_direction];
 if(!pattern||!cost||!direction||!reactions[s.reaction_style])return null;
 return {pattern_insight:pattern.summary,emotional_insight:cost.summary,primary_skill:cost.skill,skill_explanation:skills[cost.skill].definition,desired_benefit:direction.benefits[cost.skill],pattern,cost,skill:skills[cost.skill],direction,mirror:emotionalMirror(s)};
}
