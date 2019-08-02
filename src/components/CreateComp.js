
const {
    Col,
    Input,
    Select,
    Cascader,
    DatePicker,
    TreeSelect
} = window.ANTD;

const { Option } = Select;
const {RangePicker} = DatePicker
const TreeNode = TreeSelect.TreeNode;



//生成filter筛选项的每一个col
export  function CreateFilterCols(params={}){

    const colStyle = {
        marginBottom: '15px'
    }


    if(params instanceof Array){
        return params.map(item=>createCol(item))
    }else if (typeof params=='object'){
        return createCol(params);
    }else{
        console.error('请传入array 或者 Object类型的参数');
    }


    function createCol(item){
        const {
            type='Input',
            name='key',
            optionNameKey='name',//每一个下拉框获取的时候取的字段名称
            initialValue='',
            ph='请输入',
            style={},
            onChange=()=>{},
            onPressEnter=()=>{},//按下enter键盘
            optionLists=[],
            getFieldDecorator,
            rules=[],
            ...rest
        } = item;


        let Inp = null;

        if(type=='Input'){
            Inp =<Input placeholder={ph}
                        onPressEnter={() => {
                            onPressEnter()
                        }}
                        {...rest}
            />
        }
        if(type=='Select'){
            Inp =<Select placeholder={ph}
                         style={{width: '100%',...style}}
                         onChange={onChange}
                         {...rest}
            >
                {CreateSelectOptions(optionLists||[],optionNameKey)}
            </Select>
        }
        if(type=='Cascader'){
            Inp =<Cascader placeholder={ph}
                           style={{width: '100%',...style}}
                           onChange={onChange}
                           {...rest}
            />
        }
        if(type=='RangePicker'){
            Inp =<RangePicker placeholder={ph}
                              style={{width: '100%',...style}}
                              onChange={onChange}
                              {...rest}
            />
        }

        if(type=='TreeSelect'){
            Inp =<TreeSelect placeholder={ph}
                             style={{width: '100%',...style}}
                             onChange={onChange}
                             dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                             allowClear={true}
                             treeDefaultExpandAll
                             {...rest}
            >
                {CreateOptionsTree(optionLists||[],optionNameKey)}
            </TreeSelect>
        }

        return <Col xs={20} sm={12} md={6} lg={6} xl={6} style={colStyle} key={name}>
            {getFieldDecorator(name,!initialValue || !initialValue.length? {
                rules
            }:{
                rules,
                initialValue
            })(
                Inp
            )}
        </Col>
    }

}


//生成所有的部门树形列表
export function CreateOptionsTree(selects=[],name='name',id='id'){

    const {TreeNode} = window.ANTD.TreeSelect;

    return (selects || []).map((item, i) => {
        return <TreeNode value={item[id]} key={item[name]+item[id]} title={item[name]} >
            {CreateOptionsTree(item.children || [],name='name',id='id')}
        </TreeNode>
    });
};


//生成下拉框列表
export  function CreateSelectOptions(selects=[],name='name',id='id'){
    const {
        Option
    }= window.ANTD.Select;
    return (selects||[]).map((item,i)=>{
        return <Option value={item[id]} key={item[name]+item[id]}>{item[name]}</Option>
    });
}
