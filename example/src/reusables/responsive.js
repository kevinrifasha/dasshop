import React, {useRef} from "react";

export function responsive(anchor, big, small){

    return anchor > 800 ? big : small
}