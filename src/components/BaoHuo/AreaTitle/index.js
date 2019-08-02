
const {
    React,
} = window;

const {
    Row,
    Col
} =window.ANTD;


import styles from './index.less';

export default (props)=>{
    return  <Row>
        <Col span={3}>
            <h5 className={styles.areaTitle}>{props.text}</h5>
        </Col>
    </Row>
}

