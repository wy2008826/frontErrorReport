const {
    React
} = window

const {
    Table,
    Modal
} = window.ANTD

import classnames from 'classnames'
import styles from './List.less'

const confirm = Modal.confirm
import DeleteBtn from 'components/Operations/DeleteBtn.js'

const List = ({dispatch, onClickEditItem, onDeleteItem,isMotion, location, rowSelection, tableColumns, ...tableProps}) => {
    // location.query = queryString.parse(location.search)

    const handleMenuClick = (record,type, e) => {
        if (type === 'edit') {//编辑
            onClickEditItem(true, record)
        } else if (type === 'delete') {//删除
            confirm({
                title: '确定删除么?',
                onOk() {
                    onDeleteItem(record.code)
                },
            })
        }
    };
    tableColumns.push({
        title: '操作',
        key: 'oo',
        width: 100,
        render: (text, record) => {
            return <div>
                <DeleteBtn  onClick={e => handleMenuClick(record, 'delete',e)}/>
                {/* <EditBtn  onClick={e => handleMenuClick(record, 'edit',e)}/> */}
            </div>;
        },
    })
    return (
        <div className={styles.table}>
            <Table
                {...tableProps}
                className={classnames({[styles.table]: true, [styles.motion]: isMotion})}
                bordered
                scroll={{ x: 800 }}
                columns={tableColumns}
                simple
                rowKey={record => record.code}
                rowSelection={rowSelection}
                // getBodyWrapper={getBodyWrapper}
            />
        </div>
    )
};

export default List
