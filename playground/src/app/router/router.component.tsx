import { Router as BaseRouter, useNavigate } from '@solidjs/router';
import { lazy } from 'solid-js';

export var routes = [
  {
    path: '/base',
    component: lazy(() => {
      return import('@src/app/pages/base/base.component').then((module) => {
        return {
          default: module.Base,
        };
      });
    }),
  },
  {
    path: '/nested',
    component: lazy(() => {
      return import('@src/app/pages/nested/nested.component').then((module) => {
        return {
          default: module.Nested,
        };
      });
    }),
  },
  {
    path: '*404',
    component: () => {
      var navigate = useNavigate();

      navigate('/');

      return null;
    },
  },
];

export var Router = () => {
  return (
    <BaseRouter
      root={lazy(() => {
        return import('@src/app/pages/index/index.component').then((module) => {
          return {
            default: module.Index,
          };
        });
      })}
    >
      {routes as any}
    </BaseRouter>
  );
};
