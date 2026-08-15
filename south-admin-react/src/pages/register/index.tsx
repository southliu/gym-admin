import type { RegisterData } from '@/servers/login';
import type { FormProps } from 'antd';
import { Button, message } from 'antd';
import { Form, Input } from 'antd';
import I18n from '@/components/I18n';
import Theme from '@/components/Theme';
import { register } from '@/servers/login';
import { setTitle } from '@/utils/helper';
import { getFirstMenu } from '@/menus/utils/helper';
import { getMenuList } from '@/servers/system/menu';
import Logo from '@/assets/images/logo.svg';

function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [, setToken] = useToken();
  const [isLoading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { menuList } = useCommonStore();
  const setMenuList = useMenuStore((state) => state.setMenuList);
  const setThemeValue = usePublicStore((state) => state.setThemeValue);
  const { setPermissions, setUserInfo } = useUserStore((state) => state);
  const themeCache = (localStorage.getItem(THEME_KEY) || 'light') as ThemeType;

  useEffect(() => {
    if (!themeCache) {
      localStorage.setItem(THEME_KEY, 'light');
    }
    if (themeCache === 'dark') {
      document.body.className = 'theme-dark';
    }
    setThemeValue(themeCache === 'dark' ? 'dark' : 'light');
  }, [themeCache, setThemeValue]);

  useEffect(() => {
    setTitle(t, '注册账号');
  }, [i18n.language, t]);

  /** 获取菜单数据 */
  const getMenuData = async () => {
    if (menuList?.length) return menuList;
    let result: SideMenu[] = [];

    try {
      setLoading(true);
      const { code, data } = await getMenuList();
      if (Number(code) !== 200) return;
      setMenuList(data || []);
      result = data;
    } finally {
      setLoading(false);
    }

    return result;
  };

  /** 菜单跳转 */
  const handleGoMenu = async (permissions: string[]) => {
    let menuData: SideMenu[] = menuList;
    if (!menuData?.length) {
      menuData = (await getMenuData()) as SideMenu[];
    }

    const firstMenu = getFirstMenu(menuData, permissions);
    if (!firstMenu) {
      return messageApi.error({ content: '暂无访问权限', key: 'permissions' });
    }
    navigate(firstMenu);
  };

  /**
   * 处理注册
   */
  const handleFinish: FormProps['onFinish'] = async (values: RegisterData) => {
    try {
      setLoading(true);
      const { code, data } = await register(values);
      if (Number(code) !== 200) return;
      const { token, user, permissions } = data;

      if (!permissions?.length || !token) {
        return messageApi.error({ content: '暂无访问权限', key: 'permissions' });
      }

      // 注册成功自动登录
      setToken(token);
      setUserInfo(user);
      setPermissions(permissions);
      handleGoMenu(permissions);
    } finally {
      setLoading(false);
    }
  };

  /** 点击返回登录 */
  const onGoLogin = () => {
    navigate('/login');
  };

  return (
    <>
      {contextHolder}
      <div
        className={`
          ${themeCache === 'dark' ? 'bg-black text-white' : 'bg-light-400'}
          w-screen
          h-screen
          relative
        `}
      >
        <div className="flex absolute top-5 right-5">
          <I18n />
          <Theme />
        </div>
        <div
          className={`
            ${themeCache === 'dark' ? 'bg-black bg-dark-200' : 'bg-white'}
            w-380px
            p-1.8rem
            rounded-10px
            box-border
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            shadow-[2px_5px_20px_rgba(0,0,0,0.1)]
          `}
        >
          <div className="pb-20px pt-10px flex items-center justify-center">
            <img className="mr-2 object-contain" width="32" height="32" src={Logo} alt="LOGO" />
            <span className="text-22px font-bold tracking-2px">注册账号</span>
          </div>
          <Form
            form={form}
            layout="vertical"
            name="register"
            autoComplete="on"
            onFinish={handleFinish}
          >
            <div className="text-#AAA6A6 text-14px mb-8px">用户名</div>
            <Form.Item
              name="username"
              className="!mb-15px"
              rules={[
                { required: true, message: '请输入用户名' },
              ]}
            >
              <Input
                allow-clear="true"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <div className="text-#AAA6A6 text-14px mb-8px">密码</div>
            <Form.Item
              name="password"
              className="!mb-15px"
              rules={[
                { required: true, message: '请输入密码' },
                PASSWORD_RULE(t),
              ]}
            >
              <Input.Password
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="text-#AAA6A6 text-14px mb-8px">确认密码</div>
            <Form.Item
              name="confirmPassword"
              className="!mb-15px"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="flex gap-15px">
              <Form.Item
                name="name"
                className="flex-1 !mb-15px"
              >
                <Input
                  allow-clear="true"
                  placeholder="姓名（选填）"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                className="flex-1 !mb-15px"
              >
                <Input
                  allow-clear="true"
                  placeholder="手机号（选填）"
                />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full mt-15px mb-15px rounded-5px tracking-2px"
              loading={isLoading}
            >
              注册账号
            </Button>
          </Form>

          <div className="text-center text-blue-500 cursor-pointer" onClick={onGoLogin}>
            已有账号？返回登录
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
